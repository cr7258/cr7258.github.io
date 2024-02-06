---
title: 使用 ezctl 工具部署和管理 Kubernetes 集群
author: Se7en
date: 2022/04/03 20:00
categories:
 - 原创
tags:
 - Kubernetes
---

# 使用 ezctl 工具部署和管理 Kubernetes 集群

## 1 ezctl 命令行介绍
kubeasz 项目致力于快速部署高可用的 Kubernetes 集群，同时也提供了关于 Kubernetes 详细的学习资料，在这里强烈推荐给初学者。kubeasz 项目地址：https://github.com/easzlab/kubeasz 。

kubeasz 项目使用 ezctl 方便地创建和管理多个 Kubernetes 集群，ezctl 使用 shell  脚本封装 ansible-playbook  执行命令，它十分轻量、简单和易于扩展。查看 ezctl 工具的命令行提示信息，如下所示：
```bash
Usage: ezctl COMMAND [args]
-------------------------------------------------------------------------------------
Cluster setups:
    list		                     to list all of the managed clusters
    checkout    <cluster>            to switch default kubeconfig of the cluster
    new         <cluster>            to start a new k8s deploy with name 'cluster'
    setup       <cluster>  <step>    to setup a cluster, also supporting a step-by-step way
    start       <cluster>            to start all of the k8s services stopped by 'ezctl stop'
    stop        <cluster>            to stop all of the k8s services temporarily
    upgrade     <cluster>            to upgrade the k8s cluster
    destroy     <cluster>            to destroy the k8s cluster
    backup      <cluster>            to backup the cluster state (etcd snapshot)
    restore     <cluster>            to restore the cluster state from backups
    start-aio		                 to quickly setup an all-in-one cluster with 'default' settings

Cluster ops:
    add-etcd    <cluster>  <ip>      to add a etcd-node to the etcd cluster
    add-master  <cluster>  <ip>      to add a master node to the k8s cluster
    add-node    <cluster>  <ip>      to add a work node to the k8s cluster
    del-etcd    <cluster>  <ip>      to delete a etcd-node from the etcd cluster
    del-master  <cluster>  <ip>      to delete a master node from the k8s cluster
    del-node    <cluster>  <ip>      to delete a work node from the k8s cluster

Extra operation:
    kcfg-adm    <cluster>  <args>    to manage client kubeconfig of the k8s cluster

Use "ezctl help <command>" for more information about a given command.

-   命令集 1：集群安装相关操作
    -   显示当前所有管理的集群
    -   切换默认集群
    -   创建新集群配置
    -   安装新集群
    -   启动临时停止的集群
    -   临时停止某个集群（包括集群内运行的 pod）
    -   升级集群 k8s 组件版本
    -   删除集群
    -   备份集群（仅 etcd 数据，不包括 pv 数据和业务应用数据）
    -   从备份中恢复集群
    -   创建单机集群（类似 minikube）
-   命令集 2：集群节点操作
    -   增加 etcd 节点
    -   增加主节点
    -   增加工作节点
    -   删除 etcd 节点
    -   删除主节点
    -   删除工作节点
-   命令集3：额外操作
    -   管理客户端 kubeconfig
```
## 2 单机 All in One 快速部署 Kubernetes 环境
首先介绍一下如何在单机环境上快速部署一个单节点的 Kubernetes 集群，在国内环境下比官方的 minikube 方便、简单很多。

### 2.1 基础系统配置
-   准备一台虚机配置内存 2G，硬盘 30G 以上。
-   最小化安装`Ubuntu 16.04 server`或者`CentOS 7 Minimal`。

**注意:** 确保在干净的系统上开始安装，不要使用曾经装过 kubeadm 或其他 Kubernetes 发行版的环境。

### 2.2 下载文件
下载工具脚本 ezdown，例如使用最新的 kubeasz 版本 3.1.1。
```bash
export release=3.1.1
wget https://github.com/easzlab/kubeasz/releases/download/${release}/ezdown
chmod +x ./ezdown
```
下载安装部署 Kubernetes 需要的依赖和镜像。
```bash
./ezdown -D
```
下载系统包（可选，当无法使用 yum/apt 在线安装系统包时可以使用）
```bash
./ezdown -P
```
上述脚本运行成功后，所有文件（kubeasz 代码、二进制、离线镜像）均已整理好放入目录 `/etc/kubeasz`。
-   `/etc/kubeasz` 包含 kubeasz 版本为 ${release} 的发布代码。
-   `/etc/kubeasz/bin` 包含 kubernetes/etcd/docker/cni 等二进制文件。
-   `/etc/kubeasz/down` 包含集群安装时需要的离线容器镜像。
-   `/etc/kubeasz/down/packages` 包含集群安装时需要的系统基础软件。

### 2.3 安装集群
运行 kubeasz 容器，在 kubeasz 容器中封装了 ezctl  和 ansible。
```bash
./ezdown -S
```

使用默认配置安装 aio(All in One) 集群。
```
docker exec -it kubeasz ezctl start-aio
```

接下来 kubeasz 会使用 ansible playbook 来部署 Kubernetes，运行完毕后如下图所示。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211213130452.png)

### 2.4 验证安装
如果提示 `kubectl: command not found`，退出重新 ssh 登录一下，让环境变量生效即可。
```bash
$ kubectl version         # 验证集群版本 
$ kubectl get node        # 验证节点就绪 (Ready) 状态
$ kubectl get pod -A      # 验证集群 pod 状态，默认已安装网络插件、coredns、metrics-server 等
$ kubectl get svc -A      # 验证集群服务状态
```

### 2.5 登录 Dashboard
默认情况下，Kubernetes Dashboard 已经使用 NodePort 类型的 Service 发布服务了。
```bash
$ kubectl get svc -n kube-system|grep dashboard
dashboard-metrics-scraper   ClusterIP   10.68.53.35     <none>        8000/TCP                 10m
kubernetes-dashboard        NodePort    10.68.181.208   <none>        443:31538/TCP            10m
```
在 Kubernetes 集群外部通过 https://<节点 IP>:<NodePort 端口> 访问 Dashboard。我们选择使用 Token 方式登录 Dashboard，使用以下命令获取 Token。
```bash
# 获取 Bearer Token，找到输出中 ‘token:’ 开头的后面部分
$ kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep admin-user | awk '{print $1}')
Name:         admin-user-token-4mj2j
Namespace:    kube-system
Labels:       <none>
Annotations:  kubernetes.io/service-account.name: admin-user
              kubernetes.io/service-account.uid: 86a705ae-50be-4523-8ccb-ceaa0e2bc224

Type:  kubernetes.io/service-account-token

Data
====
token:      eyJhbGciOiJSUzI1NiIsImtpZCI6InlMTng0WTE5NUh3UTg0ZVZ5U1pqTjN6RWZjOHZjT25DRXZmRmdBWjNPQ0UifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLTRtajJqIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiI4NmE3MDVhZS01MGJlLTQ1MjMtOGNjYi1jZWFhMGUyYmMyMjQiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06YWRtaW4tdXNlciJ9.QHOOBISVRqvdKCbt53-tK2wa9FF3vxvWI4bZLlThhNScqP77q6g3wINVa7f4FGomi7uyuvnU4Hsgdzvey9k_FFg5qtpfR4Rzk8i9GcN7N9-FJFZ9w5yXjbftd0hSQynnySQDD_T2hDdID07LJX_fIbSlNhiRtf-FJVD0LyNxVPgdF9XQ8D_Liqs2IQMhWYD6fVb5QNlm98wzFP8B6RD_X7iMW_CFjyKyxOG7-20cm733ilcumQA8qXty1iTcO4WHasJzFLH7Ovd7Ds-9vcgYiJESPvn9oQV8cilJ5DDhTd9tkPxvYP0aYXDpH3ipjOrPONbBjzjbJ7wFItVOjWAr4A
ca.crt:     1350 bytes
namespace:  11 bytes
```

粘贴 Token，点击登录。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211213132600.png)

登录成功后的页面如下图所示。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211213132933.png)
### 2.6 清理现场
在宿主机上，按照如下步骤清理

-   清理集群 `docker exec -it kubeasz ezctl destroy default`。
-   清理运行的容器 `./ezdown -C`。
-   清理容器镜像 `docker system prune -a`。
-   停止 docker 服务 `systemctl stop docker`。
-   使用以下命令删除 docker 文件。

```
 umount /var/run/docker/netns/default
 umount /var/lib/docker/overlay
 rm -rf /var/lib/docker /var/run/docker
```

上述清理脚本执行成功后，建议重启节点，以确保清理残留的虚拟网卡、路由等信息。

## 3 部署多套 Kubernetes 集群
使用一台单独的机器作为 ezctl 的部署节点，ezctl 节点需要能够免密登录部署 Kubernetes 的机器，并且在 ezctl 节点上安装好 ansible（或者直接使用 kubeasz 容器）。
![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211214205711.png)

### 3.1 机器规划
| 主机名                 | IP 地址       | 角色     | 集群   |
|---------------------|-------------|--------|------|
| cluster01-1 | 11.8.36.159 | master | 集群 1 |
| cluster01-2 | 11.8.36.161 | worker | 集群 1 |
| cluster01-3 | 11.8.36.160 | worker | 集群 1 |
| cluster02-1 | 11.8.36.162 | master | 集群 2 |
| cluster02-2 | 11.8.36.163 | worker | 集群 2 |
| cluster02-3 | 11.8.38.148 | worker | 集群 2 |
| ansible01   | 11.8.36.21  | ezctl 节点 |  |

### 3.2 配置免密登录
在 ansible01 机器上配置对 Kubernetes 节点的免密登录。
```bash
# 生产公私钥对
ssh-keygen

# 拷贝公钥到其他机器
ssh-copy-id root@11.8.36.159
ssh-copy-id root@11.8.36.161
ssh-copy-id root@11.8.36.160
ssh-copy-id root@11.8.36.162
ssh-copy-id root@11.8.36.163
ssh-copy-id root@11.8.38.148
```

### 3.3 创建配置文件
使用以下命令生成 Kubernetes 集群的配置文件，在 `/etc/kubeasz/clusters/<集群名>` 目录下会生产 hosts 和 config.yml 两个配置文件。
```bash
# cluster01 是自己取的集群名
./ezctl new cluster01
```
修改 hosts 配置文件，设置相关节点角色的 IP 地址，其他配置可以保持默认。config.yml 配置文件可以保持默认。
```bash
# cluster01 主机信息
# 'etcd' cluster should have odd member(s) (1,3,5,...)
[etcd]
11.8.36.159
11.8.36.161
11.8.36.160

# master node(s)
[kube_master]
11.8.36.159

# work node(s)
[kube_node]
11.8.36.161
11.8.36.160

# 设置网络插件为 calico (可选)，默认是 flannel 
CLUSTER_NETWORK= "calico"
```
### 3.4 安装集群
使用以下命令安装 Kubernetes 集群。
```bash
# 一键安装
./ezctl setup cluster01 all

# 或者分步安装，具体使用 ezctl help setup 查看分步安装帮助信息
./ezctl setup cluster01 01
./ezctl setup cluster01 02
./ezctl setup cluster01 03
./ezctl setup cluster01 04
...
```

重复步骤 3.3 创建配置文件和 3.4 安装集群创建 cluster02 集群。

### 3.5 查看集群状态
```bash
# cluster01 状态
root@cluster01-1:/root #kubectl get node
NAME          STATUS                     ROLES    AGE   VERSION
11.8.36.159   Ready,SchedulingDisabled   master   91m   v1.22.2
11.8.36.160   Ready                      node     90m   v1.22.2
11.8.36.161   Ready                      node     90m   v1.22.2

# cluster02 状态
root@cluster02-1:/root #kubectl get node
NAME          STATUS                     ROLES    AGE     VERSION
11.8.36.162   Ready,SchedulingDisabled   master   5m43s   v1.22.2
11.8.36.163   Ready                      node     4m56s   v1.22.2
11.8.38.148   Ready                      node     4m56s   v1.22.2
```

## 4 备份和恢复 Etcd
Kubernetes 使用 Etcd 数据库来存储集群中的数据，Etcd 备份的是某一时刻 Kubernetes 集群中的完整状态。接下来将分别介绍 Etcd 的备份与恢复：
- 从运行的 Etcd 集群备份数据到磁盘文件。
- 从 Etcd 备份文件恢复数据，从而使集群恢复到备份时状态。

首先在已经搭建好的 Kubernetes 集群中部署两个测试 deployment。
```bash
kubectl create deployment nginx-a --image=nginx
kubectl create deployment nginx-b --image=nginx
```
查看 deployment 和 pod 运行状态。
```bash
$ kubectl get deployments.apps 
NAME      READY   UP-TO-DATE   AVAILABLE   AGE
nginx-a   1/1     1            1           34s
nginx-b   1/1     1            1           30s

$ kubectl get pod 
NAME                       READY   STATUS    RESTARTS   AGE
nginx-a-76865cf8c8-w4mqf   1/1     Running   0          29s
nginx-b-6bcf96755c-wwgs4   1/1     Running   0          25s
```
### 4.1 备份数据
接下来使用 `ezctl backup` 命令对集群 cluster01 的 Etcd 进行备份，在备份的时候 Kubernetes 集群中的服务不受影响。
```bash
./ezctl backup cluster01
```
执行完毕可以在部署 ezctl 主机的 `
/etc/kubeasz/clusters/<集群名>/backup/`目录下检查备份情况，其中，snapshot.db 始终为最近一次备份文件，还有一个带有时间戳的文件表示具体的备份版本，因为我们当前只有一次备份，因此这两个备份文件的内容是一样的。
```bash
$ ls -l /etc/kubeasz/clusters/cluster01/backup/
total 6160
-rw------- 1 root root 3149856 Dec 14 13:28 snapshot_202112141328.db
-rw------- 1 root root 3149856 Dec 14 13:29 snapshot.db
```
现在我们假装误删除 deployment nginx-a。
```bash
kubectl delete deployments.apps nginx-a

# 查看当前的 deployment，现在只剩下 nginx-b
$ kubectl get deployments.apps 
NAME      READY   UP-TO-DATE   AVAILABLE   AGE
nginx-b   1/1     1            1           10m
```
###  4.2 恢复数据
然后使用 `ezctl restore` 命令来恢复 Etcd 的备份数据，默认情况下是恢复最近一次的备份文件 snapshot.db，如果需要指定恢复的版本，可以在 `roles/cluster-restore/defaults/main.yml` 文件中配置需要恢复的 Etcd 备份版本。
```bash
./ezctl restore cluster01
```
在恢复的时候会停止 kube-apiserver，kube-controller-manager, kube-scheduler, kubelet, etcd 等服务，待 Etcd 恢复完毕后，再重启启动服务。
查看恢复后的 deployment 和 pod，可以看到现在 nginx-a deployment 已经恢复。
```bash
$ kubectl get deployments.apps 
NAME      READY   UP-TO-DATE   AVAILABLE   AGE
nginx-a   1/1     1            1           14m
nginx-b   1/1     1            1           14m

$ kubectl get pod 
NAME                       READY   STATUS    RESTARTS   AGE
nginx-a-76865cf8c8-w4mqf   1/1     Running   0          15m
nginx-b-6bcf96755c-wwgs4   1/1     Running   0          14m
```
## 5 参考资料
- [kubeasz github 项目地址](https://github.com/easzlab/kubeasz)
- [Deploy a Production Ready Kubernetes Cluster](https://github.com/kubernetes-sigs/kubespray)
- [Ansible for k8s](https://cloud.tencent.com/developer/article/1564975)
- [K8S 集群备份与恢复](http://www.xuyasong.com/?p=2052)
- [Kubernetes Etcd 数据备份与恢复](http://www.mydlq.club/article/74/)
- [通过备份 Etcd 来完美恢复 Kubernetes 中的误删数据](https://mp.weixin.qq.com/s/4b2COdr5q4SFfJTy3wl8gA)
