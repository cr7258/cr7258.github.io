---
title: Kubenetes 高可用集群搭建
author: Se7en
date: 2022/10/01 22:36
categories:
 - 原创
tags:
 - Kubernetes
---

# Kubenetes 高可用集群搭建

## 集群拓扑
![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Kubernetes/20201128223233.png)

## 架构说明
部署主要分为以下4个步骤：
* 1.**搭建外部etcd集群**: etcd是kubernetes集群中的一个十分重要的组件，用于保存集群所有的网络配置和对象的状态信息。本次实验通过kubelet部署static pod方式在集群外部部署一个3节点的etcd集群。
* 2.**负载均衡配置**：haproxy为3个k8s master的apiserver提供反向代理功能，另外还是用keepalived为2个haproxy提供一个VIP（虚拟IP），当主haproxy发生故障时，VIP可以自动切换到备haproxy。
* 3.**kubeadm部署集群**：部署3 master，3 worker高可用集群。
* 4.**部署Rancher**（可选）：在kubernetes集群中安装rancher-agent，将kubeadm部署的k8s集群纳管到Rancher中。Rancher可以提供可视化管理界面。

## IP地址规划

| IP            | 主机名            | 用途                 |
|---------------|----------------|--------------------|
| 192.168.1.242 | etcd1          | etcd               |
| 192.168.1.243 | etcd2          | etcd               |
| 192.168.1.244 | etcd3          | etcd               |
| 192.168.1.245 | master1        | k8s master         |
| 192.168.1.246 | master2        | k8s master         |
| 192.168.1.247 | master3        | k8s master         |
| 192.168.1.248 | worker1        | k8s worker         |
| 192.168.1.249 | worker2        | k8s worker         |
| 192.168.1.250 | worker3        | k8s worker         |
| 192.168.1.251 | haproxy-master | haproxy-master     |
| 192.168.1.252 | haproxy-backup | haproxy-backup     |
| 192.168.1.253 |                | k8s api-server VIP |

## 部署操作
### 1 etcd集群搭建

#### 1.1 前提准备

```sh
#关闭selinux
setenforce 0 && sed -i 's/^SELINUX=.*/SELINUX=disabled/' /etc/selinux/config
#关闭swap
swapoff -a && sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
#安装kubectl,kubeadm,kubelet
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64/
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg https://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF
setenforce 0
yum install -y kubelet kubeadm kubectl
systemctl enable kubelet && systemctl start kubelet
```
#### 1.2 kubelet配置
kubelet会根据/etc/kubernetes/manifests目录中的yaml文件拉起etcd的容器：
```sh
cat << EOF > /etc/systemd/system/kubelet.service.d/20-etcd-service-manager.conf
[Service]
ExecStart=
#  Replace "systemd" with the cgroup driver of your container runtime. The default value in the kubelet is "cgroupfs".
ExecStart=/usr/bin/kubelet --address=127.0.0.1 --pod-manifest-path=/etc/kubernetes/manifests --cgroup-driver=cgroupfs
Restart=always
EOF

systemctl daemon-reload
systemctl restart kubelet
```

#### 1.3 创建kubeadm配置文件
使用以下脚本为每个将要运行 etcd 成员的主机生成一个 kubeadm 配置文件：

```sh
# 指定etcd集群成员IP地址
export HOST1=192.168.1.242
export HOST2=192.168.1.243
export HOST3=192.168.1.244

# 创建临时目录来存储将被分发到其它主机上的文件
mkdir -p /tmp/${HOST1}/ /tmp/${HOST2}/ /tmp/${HOST3}/

ETCDHOSTS=(${HOST1} ${HOST2} ${HOST3})
NAMES=("infra0" "infra1" "infra2")

for i in "${!ETCDHOSTS[@]}"; do
HOST=${ETCDHOSTS[$i]}
NAME=${NAMES[$i]}
cat << EOF > /tmp/${HOST}/kubeadmcfg.yaml
apiVersion: "kubeadm.k8s.io/v1beta2"
kind: ClusterConfiguration
etcd:
    local:
        serverCertSANs:
        - "${HOST}"
        peerCertSANs:
        - "${HOST}"
        extraArgs:
            initial-cluster: infra0=https://${ETCDHOSTS[0]}:2380,infra1=https://${ETCDHOSTS[1]}:2380,infra2=https://${ETCDHOSTS[2]}:2380
            initial-cluster-state: new
            name: ${NAME}
            listen-peer-urls: https://${HOST}:2380
            listen-client-urls: https://${HOST}:2379
            advertise-client-urls: https://${HOST}:2379
            initial-advertise-peer-urls: https://${HOST}:2380
EOF
done
```
#### 1.4 生成证书颁发机构

在HOST1（192.168.1.242）主机上生成证书颁发机构：
```bash
kubeadm init phase certs etcd-ca
```
创建了如下两个文件：

```bash
/etc/kubernetes/pki/etcd/ca.crt
/etc/kubernetes/pki/etcd/ca.key
```
复制 CA 的 crt 和 key 文件到 etc/kubernetes/pki/etcd/ca.crt 和 /etc/kubernetes/pki/etcd/ca.key。


#### 1.5 为每个成员创建证书

```sh
kubeadm init phase certs etcd-server --config=/tmp/${HOST3}/kubeadmcfg.yaml
kubeadm init phase certs etcd-peer --config=/tmp/${HOST3}/kubeadmcfg.yaml
kubeadm init phase certs etcd-healthcheck-client --config=/tmp/${HOST3}/kubeadmcfg.yaml
kubeadm init phase certs apiserver-etcd-client --config=/tmp/${HOST3}/kubeadmcfg.yaml
cp -R /etc/kubernetes/pki /tmp/${HOST3}/
# 清理不可重复使用的证书
find /etc/kubernetes/pki -not -name ca.crt -not -name ca.key -type f -delete

kubeadm init phase certs etcd-server --config=/tmp/${HOST2}/kubeadmcfg.yaml
kubeadm init phase certs etcd-peer --config=/tmp/${HOST2}/kubeadmcfg.yaml
kubeadm init phase certs etcd-healthcheck-client --config=/tmp/${HOST2}/kubeadmcfg.yaml
kubeadm init phase certs apiserver-etcd-client --config=/tmp/${HOST2}/kubeadmcfg.yaml
cp -R /etc/kubernetes/pki /tmp/${HOST2}/
find /etc/kubernetes/pki -not -name ca.crt -not -name ca.key -type f -delete

kubeadm init phase certs etcd-server --config=/tmp/${HOST1}/kubeadmcfg.yaml
kubeadm init phase certs etcd-peer --config=/tmp/${HOST1}/kubeadmcfg.yaml
kubeadm init phase certs etcd-healthcheck-client --config=/tmp/${HOST1}/kubeadmcfg.yaml
kubeadm init phase certs apiserver-etcd-client --config=/tmp/${HOST1}/kubeadmcfg.yaml
mv /tmp/${HOST1}/kubeadmcfg.yaml  /etc/kubernetes
# 不需要移动 certs 因为它们是给 HOST1 使用的

# 清理不应从此主机复制的证书
find /tmp/${HOST3} -name ca.key -type f -delete
find /tmp/${HOST2} -name ca.key -type f -delete
```

#### 1.6 复制证书和kubeadm配置文件到其他两个etcd节点

```
scp -r /tmp/${HOST2}/* root@${HOST2}:/etc/kubernetes
scp -r /tmp/${HOST3}/* root@${HOST3}:/etc/kubernetes
```
确保已经所有预期的文件都存在：


```sh
[root@etcd1 ~]# tree /etc/kubernetes/
/etc/kubernetes/
├── kubeadmcfg.yaml
├── manifests
│   └── etcd.yaml
└── pki
    ├── apiserver-etcd-client.crt
    ├── apiserver-etcd-client.key
    └── etcd
        ├── ca.crt
        ├── ca.key
        ├── healthcheck-client.crt
        ├── healthcheck-client.key
        ├── peer.crt
        ├── peer.key
        ├── server.crt
        └── server.key

3 directories, 12 files

[root@etcd2 kubernetes]# tree /etc/kubernetes/
.
├── kubeadmcfg.yaml
├── manifests
│   └── etcd.yaml
└── pki
    ├── apiserver-etcd-client.crt
    ├── apiserver-etcd-client.key
    └── etcd
        ├── ca.crt
        ├── healthcheck-client.crt
        ├── healthcheck-client.key
        ├── peer.crt
        ├── peer.key
        ├── server.crt
        └── server.key

3 directories, 11 files


[root@etcd3 ~]# tree /etc/kubernetes/
/etc/kubernetes/
├── kubeadmcfg.yaml
├── manifests
│   └── etcd.yaml
└── pki
    ├── apiserver-etcd-client.crt
    ├── apiserver-etcd-client.key
    └── etcd
        ├── ca.crt
        ├── healthcheck-client.crt
        ├── healthcheck-client.key
        ├── peer.crt
        ├── peer.key
        ├── server.crt
        └── server.key

3 directories, 11 files
```

#### 1.7 生成静态Pod配置文件

```
[root@etcd1 ~]#  kubeadm init phase etcd local --config=/etc/kubernetes/kubeadmcfg.yaml  
[root@etcd2 ~]#  kubeadm init phase etcd local --config=/etc/kubernetes/kubeadmcfg.yaml  
[root@etcd3 ~]#  kubeadm init phase etcd local --config=/etc/kubernetes/kubeadmcfg.yaml  
```

#### 1.8 检查etcd集群运行情况
```sh
[root@etcd1 kubernetes]# docker run --rm -it --name etcd-check \
> --net host \
> -v /etc/kubernetes:/etc/kubernetes k8s.gcr.io/etcd:${ETCD_TAG} etcdctl \
> --cert /etc/kubernetes/pki/etcd/peer.crt \
> --key /etc/kubernetes/pki/etcd/peer.key \
> --cacert /etc/kubernetes/pki/etcd/ca.crt \
> --endpoints https://${HOST1}:2379 endpoint health --cluster
https://192.168.1.244:2379 is healthy: successfully committed proposal: took = 29.827986ms
https://192.168.1.243:2379 is healthy: successfully committed proposal: took = 30.169169ms
https://192.168.1.242:2379 is healthy: successfully committed proposal: took = 31.270748ms
```

### 2 负载均衡配置

#### 2.1 部署haproxy

##### 2.1.1 安装haproxy
```
yum install -y haproxy
```
##### 2.1.2 修改haproxy配置文件
vim /etc/haproxy/haproxy.cfg，两台haproxy的配置文件是一致的。
```sh
#---------------------------------------------------------------------
# Example configuration for a possible web application.  See the
# full configuration options online.
#
#   http://haproxy.1wt.eu/download/1.4/doc/configuration.txt
#
#---------------------------------------------------------------------

#---------------------------------------------------------------------
# Global settings
#---------------------------------------------------------------------
global
    # to have these messages end up in /var/log/haproxy.log you will
    # need to:
    #
    # 1) configure syslog to accept network log events.  This is done
    #    by adding the '-r' option to the SYSLOGD_OPTIONS in
    #    /etc/sysconfig/syslog
    #
    # 2) configure local2 events to go to the /var/log/haproxy.log
    #   file. A line like the following can be added to
    #   /etc/sysconfig/syslog
    #
    #    local2.*                       /var/log/haproxy.log
    #
    log         127.0.0.1 local2

    chroot      /var/lib/haproxy
    pidfile     /var/run/haproxy.pid
    maxconn     4000
    user        haproxy
    group       haproxy
    daemon

    # turn on stats unix socket
    stats socket /var/lib/haproxy/stats

#---------------------------------------------------------------------
# common defaults that all the 'listen' and 'backend' sections will
# use if not designated in their block
#---------------------------------------------------------------------
defaults
    mode                    http
    log                     global
    option                  httplog
    option                  dontlognull
    option http-server-close
    option forwardfor       except 127.0.0.0/8
    option                  redispatch
    retries                 3
    timeout http-request    10s
    timeout queue           1m
    timeout connect         10s
    timeout client          1m
    timeout server          1m
    timeout http-keep-alive 10s
    timeout check           10s
    maxconn                 3000

#---------------------------------------------------------------------
# main frontend which proxys to the backends
#---------------------------------------------------------------------
frontend apiserver
    bind *:6443
    mode tcp
    option tcplog
    default_backend apiserver
#---------------------------------------------------------------------
# static backend for serving up images, stylesheets and such
#---------------------------------------------------------------------
backend apiserver
    option httpchk GET /healthz
    http-check expect status 200
    mode tcp
    option ssl-hello-chk
    balance  roundrobin
    #server为三个k8s master的地址:端口
    server  master1 192.168.1.245:6443 check
    server  master2 192.168.1.246:6443 check
    server  master3 192.168.1.247:6443 check
```
##### 2.1.3 启动haproxy

```
systemctl enable haproxy --now
```
#### 2.2 部署keepalived
##### 2.2.1 安装keepalived

```
yum install -y keepalived
```
##### 2.2.2 修改keepalived配置文件
vim /etc/keepalived/keepalived.conf
keepalived master配置文件：

```sh
global_defs {
    router_id LVS_DEVEL
}
vrrp_script check_apiserver {
  script "/etc/keepalived/check_apiserver.sh"
  interval 3
  weight -2
  fall 10
  rise 2
}

vrrp_instance VI_1 {
    state MASTER #Master
    interface ens192
    virtual_router_id 51 #主备的router_id保存一致
    priority 101   #Master的优先级要高于Backup
    authentication {
        auth_type PASS
        auth_pass 42  #主备的auth_pass保存一致
    }
    virtual_ipaddress {
        192.168.1.253  #VIP
    }
    track_script {
        check_apiserver
    }
}
```
keepalived backup配置文件：

```sh
global_defs {
    router_id LVS_DEVEL
}
vrrp_script check_apiserver {
  script "/etc/keepalived/check_apiserver.sh"
  interval 3
  weight -2
  fall 10
  rise 2
}

vrrp_instance VI_1 {
    state BACKUP #BACKUP
    interface ens192
    virtual_router_id 51  #主备的router_id保存一致
    priority 100  #Master的优先级要高于Backup
    authentication {
        auth_type PASS
        auth_pass 42  #主备的auth_pass保存一致
    }
    virtual_ipaddress {
        192.168.1.253  #VIP
    }
    track_script {
        check_apiserver
    }
}
```
##### 2.2.3 编辑健康检查脚本

```
#!/bin/sh

errorExit() {
    echo "*** $*" 1>&2
    exit 1
}

curl --silent --max-time 2 --insecure https://localhost:6443/ -o /dev/null || errorExit "Error GET https://localhost:6443/"
if ip addr | grep -q 192.168.1.253; then
    curl --silent --max-time 2 --insecure https://192.168.1.253:6443/ -o /dev/null || errorExit "Error GET https://192.168.1.253:6443/"
fi
```
##### 2.2.4 启动keepalived

```
systemctl enable keepalived --now
```
### 3 kubeadm部署集群
#### 3.1 前提准备

```sh
#关闭selinux
setenforce 0 && sed -i 's/^SELINUX=.*/SELINUX=disabled/' /etc/selinux/config
#关闭swap
swapoff -a && sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
#安装kubectl,kubeadm,kubelet
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64/
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg https://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF
setenforce 0
yum install -y kubelet kubeadm kubectl
systemctl enable kubelet && systemctl start kubelet

```
#### 3.2 初始化集群
kubeadm初始化yaml文件：
```yaml
apiVersion: kubeadm.k8s.io/v1beta2
kind: ClusterConfiguration
kubernetesVersion: stable
controlPlaneEndpoint: "192.168.1.253:6443" #haproxy的keepalived提供的VIP
etcd:
    external:
        endpoints:
        - https://192.168.1.242:2379
        - https://192.168.1.243:2379
        - https://192.168.1.244:2379
        caFile: /etc/kubernetes/pki/etcd/ca.crt
        certFile: /etc/kubernetes/pki/apiserver-etcd-client.crt
        keyFile: /etc/kubernetes/pki/apiserver-etcd-client.key
```
执行初始化命令：

```sh
#--upload-certs命令用于分发证书到其他控制节点
[root@master1 kubernetes]# kubeadm init --config kubeadm-config.yaml --upload-certs
W1125 16:28:56.393074   13988 configset.go:348] WARNING: kubeadm cannot validate component configs for API groups [kubelet.config.k8s.io kubeproxy.config.k8s.io]
[init] Using Kubernetes version: v1.19.4
[preflight] Running pre-flight checks
        [WARNING IsDockerSystemdCheck]: detected "cgroupfs" as the Docker cgroup driver. The recommended driver is "systemd". Please follow the guide at https://kubernetes.io/docs/setup/cri/
[preflight] Pulling images required for setting up a Kubernetes cluster
[preflight] This might take a minute or two, depending on the speed of your internet connection
[preflight] You can also perform this action in beforehand using 'kubeadm config images pull'
[certs] Using certificateDir folder "/etc/kubernetes/pki"
[certs] Generating "ca" certificate and key
[certs] Generating "apiserver" certificate and key
[certs] apiserver serving cert is signed for DNS names [kubernetes kubernetes.default kubernetes.default.svc kubernetes.default.svc.cluster.local master1] and IPs [10.96.0.1 192.168.1.245 192.168.1.253]
[certs] Generating "apiserver-kubelet-client" certificate and key
[certs] Generating "front-proxy-ca" certificate and key
[certs] Generating "front-proxy-client" certificate and key
[certs] External etcd mode: Skipping etcd/ca certificate authority generation
[certs] External etcd mode: Skipping etcd/server certificate generation
[certs] External etcd mode: Skipping etcd/peer certificate generation
[certs] External etcd mode: Skipping etcd/healthcheck-client certificate generation
[certs] External etcd mode: Skipping apiserver-etcd-client certificate generation
[certs] Generating "sa" key and public key
[kubeconfig] Using kubeconfig folder "/etc/kubernetes"
[kubeconfig] Writing "admin.conf" kubeconfig file
[kubeconfig] Writing "kubelet.conf" kubeconfig file
[kubeconfig] Writing "controller-manager.conf" kubeconfig file
[kubeconfig] Writing "scheduler.conf" kubeconfig file
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Starting the kubelet
[control-plane] Using manifest folder "/etc/kubernetes/manifests"
[control-plane] Creating static Pod manifest for "kube-apiserver"
[control-plane] Creating static Pod manifest for "kube-controller-manager"
[control-plane] Creating static Pod manifest for "kube-scheduler"
[wait-control-plane] Waiting for the kubelet to boot up the control plane as static Pods from directory "/etc/kubernetes/manifests". This can take up to 4m0s
[apiclient] All control plane components are healthy after 22.048332 seconds
[upload-config] Storing the configuration used in ConfigMap "kubeadm-config" in the "kube-system" Namespace
[kubelet] Creating a ConfigMap "kubelet-config-1.19" in namespace kube-system with the configuration for the kubelets in the cluster
[upload-certs] Storing the certificates in Secret "kubeadm-certs" in the "kube-system" Namespace
[upload-certs] Using certificate key:
467b45aac2ebf12a6bd88d71abc91e6628698b5310529b83f9c8a8b5ec7831e6
[mark-control-plane] Marking the node master1 as control-plane by adding the label "node-role.kubernetes.io/master=''"
[mark-control-plane] Marking the node master1 as control-plane by adding the taints [node-role.kubernetes.io/master:NoSchedule]
[bootstrap-token] Using token: d0idxe.5qepodyefo6ohfey
[bootstrap-token] Configuring bootstrap tokens, cluster-info ConfigMap, RBAC Roles
[bootstrap-token] configured RBAC rules to allow Node Bootstrap tokens to get nodes
[bootstrap-token] configured RBAC rules to allow Node Bootstrap tokens to post CSRs in order for nodes to get long term certificate credentials
[bootstrap-token] configured RBAC rules to allow the csrapprover controller automatically approve CSRs from a Node Bootstrap Token
[bootstrap-token] configured RBAC rules to allow certificate rotation for all node client certificates in the cluster
[bootstrap-token] Creating the "cluster-info" ConfigMap in the "kube-public" namespace
[kubelet-finalize] Updating "/etc/kubernetes/kubelet.conf" to point to a rotatable kubelet client certificate and key
[addons] Applied essential addon: CoreDNS
[addons] Applied essential addon: kube-proxy

Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

You can now join any number of the control-plane node running the following command on each as root:

  kubeadm join 192.168.1.253:6443 --token d0idxe.5qepodyefo6ohfey \
    --discovery-token-ca-cert-hash sha256:2e864b2742535b83090b51416290d5b48cebe7b2d7b487c273e5e1bfe6248cca \
    --control-plane --certificate-key 467b45aac2ebf12a6bd88d71abc91e6628698b5310529b83f9c8a8b5ec7831e6

Please note that the certificate-key gives access to cluster sensitive data, keep it secret!
As a safeguard, uploaded-certs will be deleted in two hours; If necessary, you can use
"kubeadm init phase upload-certs --upload-certs" to reload certs afterward.

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 192.168.1.253:6443 --token d0idxe.5qepodyefo6ohfey \
    --discovery-token-ca-cert-hash sha256:2e864b2742535b83090b51416290d5b48cebe7b2d7b487c273e5e1bfe6248cca 
```

#### 3.3 加入新的master节点

```sh
  kubeadm join 192.168.1.253:6443 --token d0idxe.5qepodyefo6ohfey \
    --discovery-token-ca-cert-hash sha256:2e864b2742535b83090b51416290d5b48cebe7b2d7b487c273e5e1bfe6248cca \
    --control-plane --certificate-key 467b45aac2ebf12a6bd88d71abc91e6628698b5310529b83f9c8a8b5ec7831e6
```
#### 3.4 加入新的worker节点


```sh
kubeadm join 192.168.1.253:6443 --token d0idxe.5qepodyefo6ohfey \
    --discovery-token-ca-cert-hash sha256:2e864b2742535b83090b51416290d5b48cebe7b2d7b487c273e5e1bfe6248cca 

```
#### 3.5 查看创建完的集群

```sh
[root@master1 ~]# kubectl get node -o wide
NAME      STATUS   ROLES    AGE    VERSION   INTERNAL-IP     EXTERNAL-IP   OS-IMAGE                KERNEL-VERSION          CONTAINER-RUNTIME
master1   Ready    master   3d8h   v1.19.4   192.168.1.245   <none>        CentOS Linux 7 (Core)   3.10.0-693.el7.x86_64   docker://18.9.4
master2   Ready    master   3d6h   v1.19.4   192.168.1.246   <none>        CentOS Linux 7 (Core)   3.10.0-693.el7.x86_64   docker://18.9.4
master3   Ready    master   3d6h   v1.19.4   192.168.1.247   <none>        CentOS Linux 7 (Core)   3.10.0-693.el7.x86_64   docker://18.9.4
worker1   Ready    <none>   3d5h   v1.19.4   192.168.1.248   <none>        CentOS Linux 7 (Core)   3.10.0-693.el7.x86_64   docker://18.9.4
worker2   Ready    <none>   3d5h   v1.19.4   192.168.1.249   <none>        CentOS Linux 7 (Core)   3.10.0-693.el7.x86_64   docker://18.9.4
worker3   Ready    <none>   3d5h   v1.19.4   192.168.1.250   <none>        CentOS Linux 7 (Core)   3.10.0-693.el7.x86_64   docker://18.9.4
```
### 4 部署Rancher
#### 4.1 安装Rancher
本次实验Rancher部署在k8s集群中，需要另外搭建一个k8s集群用于部署Rancher，这里跳过搭建k8s集群的步骤。
通过helm部署Rancher：

```sh
helm repo add rancher-latest https://releases.rancher.com/server-charts/rancher-latest
helm install rancher rancher-latest/rancher \
 --namespace cattle-system \
 --set hostname=www.chengzw.top
 #安装完成后，修改cattle-system命名空间中名为rancher的service的模式为NodePort，方便我们在集群外部访问Rancher
```
#### 4.2 部署Nginx SSL卸载（可选）
部署一台nginx用于反向代理Rancher：
```nginx
events {
    worker_connections 1024;
}

http {
    #Rancher http NodePort地址
    upstream rancher {
        server 192.168.1.228:32284;
        server 192.168.1.229:32284;
        server 192.168.1.230:32284;
    }

    map $http_upgrade $connection_upgrade {
        default Upgrade;
        ''      close;
    }
    server {
        listen 443 ssl http2;
        server_name www.chengzw.top;
        #提前导入www.chengzw.top证书和私钥到指定目录
        ssl_certificate /root/cert/chengzwtop_2020.crt;
        ssl_certificate_key /root/cert/chengzwtop_2020.key;

        location / {
            proxy_set_header Host $host;
            
            #注意：如果存在此标头，则rancher/rancher不会将 HTTP 重定向到 HTTPS。
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Port $server_port;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_pass http://rancher;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_http_version 1.1;
            # This allows the ability for the execute sh window to remain open for up to 15 minutes. Without this parameter, the default is 1 minute and will automatically close.
            proxy_read_timeout 900s;
            proxy_buffering off;
        }
    }

    server {
        listen 80;
        server_name www.chengzw.top;
        return 301 https://$server_name$request_uri;
    }
}
```
#### 4.3 导入Kubernetes集群
在rancher页面点击添加集群-->导入，下载提供的yaml文件：

```
wget https://www.chengzw.top/v3/import/cdvk6hs4bt7kcdxnrplpnf9sbw2gpjzshzxbgxs854d6t9f8lscp29.yaml
```
修改cattle-cluster-agent的yaml文件，添加hostAlias指定Pod的host记录，否则Pod会去根据DNS去解析www.chengzw.top（计算宿主机写了host记录也没用，我们这里内部要解析到nginx上，如果用DNS解析会解析到公网上）。
```yaml
......
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cattle-cluster-agent
  namespace: cattle-system
spec:
  selector:
    matchLabels:
      app: cattle-cluster-agent
  template:
    metadata:
      labels:
        app: cattle-cluster-agent
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
              - matchExpressions:
                - key: beta.kubernetes.io/os
                  operator: NotIn
                  values:
                    - windows
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            preference:
              matchExpressions:
              - key: node-role.kubernetes.io/controlplane
                operator: In
                values:
                - "true"
          - weight: 1
            preference:
              matchExpressions:
              - key: node-role.kubernetes.io/etcd
                operator: In
                values:
                - "true"
      serviceAccountName: cattle
      tolerations:
      - operator: Exists
      #为cattle-cluster-agent添加host记录
      hostAliases:
      - ip: "192.168.1.231"
        hostnames:
        - "www.chengzw.top"
      containers:
        - name: cluster-register
          imagePullPolicy: IfNotPresent
          env:
          - name: CATTLE_FEATURES
            value: ""
          - name: CATTLE_IS_RKE
            value: "false"
          - name: CATTLE_SERVER
            value: "https://www.chengzw.top"
          - name: CATTLE_CA_CHECKSUM
            value: ""
          - name: CATTLE_CLUSTER
            value: "true"
          - name: CATTLE_K8S_MANAGED
            value: "true"
          image: rancher/rancher-agent:v2.5.3
          volumeMounts:
          - name: cattle-credentials
            mountPath: /cattle-credentials
            readOnly: true
          readinessProbe:
            initialDelaySeconds: 2
            periodSeconds: 5
            httpGet:
              path: /health
              port: 8080
      volumes:
      - name: cattle-credentials
        secret:
          secretName: cattle-credentials-049e86b
          defaultMode: 320
......
```
我们这里使用的证书是在阿里云上申请的受信任的证书，如果是自签名证书需要注意要将ca证书导入rancher-agent：

```yaml
 #自签名证书需要添加ca.crt到cattle-cluster-agent内部
- name: rancher-certs
  mountPath: /etc/kubernetes/ssl/certs/ca.crt
  subPath: ca.crt
```
#### 4.4 访问Rancher管理界面
![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Kubernetes/20210103152811.png)
