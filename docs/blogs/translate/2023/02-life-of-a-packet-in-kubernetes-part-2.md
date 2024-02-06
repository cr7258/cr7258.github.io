---
title: Kubernetes 中数据包的生命周期 -- 第 2 部分
author: Se7en
date: 2023/08/01 22:36
categories:
 - 翻译
tags:
 - Kubernetes
---

# Kubernetes 中数据包的生命周期 -- 第 2 部分

> 本文翻译自：[Life of a Packet in Kubernetes — Part 2 [1]](https://dramasamy.medium.com/life-of-a-packet-in-kubernetes-part-2-a07f5bf0ff14)<br>
作者：Dinesh Kumar Ramasamy<br>
本文在原文的基础上做了适当的修改，如有疑问请查阅原文。

正如我们在第 1 部分中所讨论的，CNI 插件在 Kubernetes 网络中起着至关重要的作用。当前有许多第三方 CNI 插件可供使用，Calico 便是其中之一。凭借着良好的易用性以及对多种网络架构的支持，Calico 获得了许多工程师的青睐。

Calico 支持广泛的平台，包括 Kubernetes，OpenShift，Docker EE, OpenStack 和裸金属服务。calico-node 在 Kubernetes 集群中的每个 Master 和 Worker 节点上以容器的方式运行。calico-cni 插件直接与 Kubernetes 的 kubelet 进行集成，能够发现哪些 Pod 被创建，并将它们添加到 Calico 网络中。

我们将讨论 Calico 的安装、模块（Felix, BIRD, Confd）和路由模式。

**不包括什么？** Network Policy（网络策略），在第 3 部分的文章中将会进行介绍，因此本文暂时跳过。

## CNI 要求
- 1.创建 veth-pair 并接入到容器中。
- 2.确认正确的 Pod CIDR。
- 3.创建 CNI 配置文件。
- 4.分配和管理 IP 地址。
- 5.在容器内添加默认路由。
- 6.将路由通告给所有的对等节点（peer node）。（不适用于 VxLan）
- 7.在宿主机中添加路由。
- 8.执行网络策略。

除此之外，还有许多其他要求，但以上是基本要求。让我们看看 Master 和 Worker 节点中的路由表。每个节点中都包含一个带有 IP 地址和默认路由的容器。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220421143834.png)

通过查看路由表，可以很明显地发现 Pod 能够通过 L3 网络相互通信，因为路由是完美的。哪个模块负责添加这些路由条目，以及它是如何得到远程的路由？另外，为什么容器的默认网关是 169.254.1.1？让我们一会儿再谈。

Calico 的核心组件是 Bird, Felix, ConfD, Etcd 和 Kubernetes API Server。数据存储用于保存配置信息（IP 地址池，端点信息，网络策略等等）。在我们的示例中，将使用 Kubernetes 作为 Calico 的数据存储。

> Calico 有两种数据存储可供选择：
>  - **etcd** - 直接连接 Etcd 集群，优点是：
     > 1.可以在非 Kubernetes 平台（例如 OpenStack） 上运行 Calico。
     > 2.分离 Kubernetes 和 Calico 资源的存储，便于单独扩展数据存储。
     > 3.允许在多个 Kubernetes 集群之上运行一个 Calico 集群，实现跨集群的网络互通。
> -  **Kubernetes** - 连接 Kubernetes API Server，优点是：
     > 1.无需额外的存储，更易于管理。
     > 2.可以使用过 Kubernetes RBAC 来控制对 Calico 资源的访问。
     > 3.可以使用 Kubernetes 审计日志对 Calico 资源的更改进行审计。

## 模块和功能
Calico 的架构图如下所示，详细的架构说明参见：[Component architecture](https://projectcalico.docs.tigera.io/reference/architecture/overview) [2]，本文只介绍 BIRD, ConfD 和 Felix 这 3 个主要模块。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220424113124.png)
### BIRD (BGP)
BIRD 是每个节点的 BGP 守护进程，运行在 calico-node 容器中。BIRD 负责从 Felix 获取路由并与其他节点上的 BGP Peer 交换路由信息。常见的拓扑是点对点的网络，建立全互联的 BGP 连接关系。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220421150401.png)

对于大规模部署，这可能会变得混乱。可以通过将某些节点配置为 Route Reflectors（路由反射器）来完成路由的传播，以减少 BGP 连接的数量。每个 BGP 节点只与路由反射器建立 Peer 连接关系，发送到路由反射器的路由通告随后会反射到所有其他的 BGP 节点。关于路由反射器的详情，请参阅 [BGP Route Reflection](https://datatracker.ietf.org/doc/html/rfc4456) [3]。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220421150416.png)

BIRD 实例负责将路由传播到其他 BIRD 实例。默认配置是 BGP Mesh（全互联），可用于小型部署。在大规模部署中，建议使用路由反射器来避免性能问题。可以使用多个 RR（Route Reflectors）保证高可用，此外还可以在集群外部设置 RR（例如硬件路由器）。

### ConfD
ConfD 是一个简单的配置管理工具，以守护进程的方式运行在 calico-node 容器中。ConfD 会监视 Calico 数据存储中的配置更改，并更新 BIRD 的配置文件。因此，每当网络发生变化时，BIRD 都可以检测到，并将路由传播到其他节点。

### Felix
Calico Felix 守护进程在 calico-node 容器中运行，负责为容器设置网络资源（IP地址、路由、Iptables 规则等等）。

让我们看一下包含所有 Calico 模块的 Kubernetes 集群。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220421152804.png)


数据包是如何路由到对等节点的？
- 1.在 Master 节点中的 Pod 尝试 ping 10.0.2.11。
- 2.Pod 向网关发送 ARP 请求。
- 3.从 ARP 响应中获取 MAC 地址。
- 4.**等等**，是谁发送了 ARP 响应？

发生了什么？容器的路由为什么可以指向一个不存在的 IP 地址（169.254.1.1）？让我们来看看正在发生的事情。一些读者可能已经注意到 169.254.1.1 是 IPv4 的链路本地地址（Link-local Address）。容器有一条指向链路本地地址的默认路由。容器期望这个 IP 地址可以通过其直连接口进行访问，在本例中为容器的 eth0 接口。当容器想要通过默认路由发送数据包时，它将尝试发送 ARP 请求以获取这个 IP 的 MAC 地址。

如果我们捕获 ARP 响应，可以看到返回的是 veth 另一端（cali123）的 MAC 地址。我们在主机上查看所有网卡会发现，cali 所有网卡的 MAC 地址都是 **ee:ee:ee:ee:ee:ee**。所以你可能想知道主机到底是如何为一个不存在的 IP 地址响应 ARP 请求的。答案是代理 ARP（proxy-arp），Calico 本质上是利用了代理 ARP 撒了一个“善意的谎言”。如果我们检查主机端的 veth 接口，我们可以看到已经启用了 proxy-arp。
```bash
master $ cat /proc/sys/net/ipv4/conf/cali123/proxy_arp  
1
```

> 代理 ARP 是 ARP 协议的一个变种，**当 ARP 请求目标跨网段时**，网关设备收到此 ARP 请求，会用自己的 MAC 地址返回给请求者，这便是代理 ARP（Proxy ARP）。

让我们仔细看看 Worker 节点。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220422105711.png)


一旦数据包到达内核，它会根据路由表条目对数据包进行路由。

**传入流量**
- 1.数据包到达 Worker 节点的内核。
- 2.内核将数据包放入 cali123 接口。


## 路由模式
Calico 支持 3种路由模式；在本章节中，我们将了解每种方法的优缺点以及各自的使用场景。
- **IP-in-IP**：默认使用路由的模式，有封装。
- **Direct/NoEncapMode**：无封装（首选）。
- **VXLAN**：有封装（无 BGP）。

### IP-in-IP （默认）
IP-in-IP 是一种简单的封装形式，通过将一个 IP 数据包放入另一个数据包中来实现。传输的数据包包含一个带有**主机**源和目标 IP 的外部标头和一个带有 **Pod** 源和目标 IP 的内部标头。

Azure 不支持 IP-IP（据我所知）；因此，我们无法在那种环境中使用 IP-IP。最好禁用 IP-IP 以获得更好的性能。

### NoEncapMode（无封装模式）
在这种模式下，发送的数据包就好像它们直接来自 Pod。由于没有封装和解封装带来的开销，NoEncapMode 有着更好的性能。

必须在 AWS 中禁用源 IP 检查才能启用此模式。

### VXLAN
Calico 3.7+ 版本支持 VXLAN 路由模式。

> VXLAN 的全称是 **Virtual Extensible LAN（虚拟可扩展局域网）** 。VXLAN 本质上是一种隧道技术，在源网络设备与目的网络设备之间的 IP 网络上，建立一条逻辑隧道，将用户侧报文经过特定的封装后通过这条隧道转发。从用户的角度来看，接入网络的服务器就像是连接到了一个虚拟的二层交换机的不同端口上，可以方便地通信。**VTEP（VXLAN Tunnel Endpoints，VXLAN 隧道端点）** 是 VXLAN 网络的边缘设备，是 VXLAN 隧道的起点和终点，VXLAN 对用户原始数据帧的**封装和解封装**均在 VTEP 上进行。

VXLAN 非常适合不支持 IP-in-IP 的网络，例如 Azure 或任何其他不支持 BGP 的 DC（DataCenter, 数据中心）。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220422114402.png)

## 演示 -- IPIP 和 UnEncapMode

在安装 Calico 之前检查集群状态，可以看到所有节点都处于 **NotReady** 状态，这种情况是正常的，因为我们还没有安装任何 CNI，因此集群节点上的 kubelet 会检测并报告节点的状态为 **NotReady**。

事实上，如果这个时候去部署一个非 **hostNetwork** 的 Pod，就会处于 **Pending** 的状态，因为集群的调度器不能找到 **Ready** 的节点来运行 Pod。但是，对于 Kubernetes 的系统组件，如 API Server、Kube-Scheduler、Kube-Controller-Manager 等，因为它们是 **hostNetwork** 的 Pod，所以即使在未安装 CNI 组件的情况下也能正常运行。

```bash
master $ kubectl get nodes
NAME           STATUS     ROLES    AGE   VERSION
controlplane   NotReady   master   40s   v1.18.0
node01         NotReady   <none>   9s    v1.18.0

master $ kubectl get pods --all-namespaces
NAMESPACE     NAME                                   READY   STATUS    RESTARTS   AGE
kube-system   coredns-66bff467f8-52tkd               0/1     Pending   0          32s
kube-system   coredns-66bff467f8-g5gjb               0/1     Pending   0          32s
kube-system   etcd-controlplane                      1/1     Running   0          34s
kube-system   kube-apiserver-controlplane            1/1     Running   0          34s
kube-system   kube-controller-manager-controlplane   1/1     Running   0          34s
kube-system   kube-proxy-b2j4x                       1/1     Running   0          13s
kube-system   kube-proxy-s46lv                       1/1     Running   0          32s
kube-system   kube-scheduler-controlplane            1/1     Running   0          33s
```

检查 CNI 的 bin 和 conf 目录，确保里面没有任何配置文件或者 Calico 的二进制文件，安装 Calico 时将会往该目录存放这些文件。
```bash
master $ cd /etc/cni
-bash: cd: /etc/cni: No such file or directory
master $ cd /opt/cni/bin
master $ ls
bridge  dhcp  flannel  host-device  host-local  ipvlan  loopback  macvlan  portmap  ptp  sample  tuning  vlan
```

检查 Master/Worker 节点的路由。
```bash
master $ ip route
default via 172.17.0.1 dev ens3
172.17.0.0/16 dev ens3 proto kernel scope link src 172.17.0.32
172.18.0.0/24 dev docker0 proto kernel scope link src 172.18.0.1 linkdown
```

下载并应用 calico.yaml 文件。
```bash
curl https://docs.projectcalico.org/manifests/calico.yaml -O kubectl apply -f calico.yaml
```

我们来看看一些有用的配置参数。
```yaml
cni_network_config: |-
    {
      "name": "k8s-pod-network",
      "cniVersion": "0.3.1",
      "plugins": [
        {
          "type": "calico", # Calico 插件
          "log_level": "info",
          "log_file_path": "/var/log/calico/cni/cni.log",
          "datastore_type": "kubernetes",
          "nodename": "__KUBERNETES_NODE_NAME__",
          "mtu": __CNI_MTU__,
          "ipam": {
              "type": "calico-ipam" # Calico IPAM 插件，管理和分配 IP 地址
          },
          "policy": {
              "type": "k8s"
          },
          "kubernetes": {
              "kubeconfig": "__KUBECONFIG_FILEPATH__"
          }
        },
        {
          "type": "portmap",
          "snat": true,
          "capabilities": {"portMappings": true}
        },
        {
          "type": "bandwidth",
          "capabilities": {"bandwidth": true}
        }
      ]
    }
# Enable IPIP
- name: CALICO_IPV4POOL_IPIP
    value: "Always" # 设置为 Never 可以禁用 IP-IP
# Enable or Disable VXLAN on the default IP pool.
- name: CALICO_IPV4POOL_VXLAN
    value: "Never"
```

检查安装 Calico 后 Pod 和 Node 的状态，可以看到 Node 已经处于 Ready 状态，并且 Pod 正在初始化或者创建中。
```bash
master $ kubectl get pods --all-namespaces
NAMESPACE     NAME                                       READY   STATUS              RESTARTS   AGE
kube-system   calico-kube-controllers-799fb94867-6qj77   0/1     ContainerCreating   0          21s
kube-system   calico-node-bzttq                          0/1     PodInitializing     0          21s
kube-system   calico-node-r6bwj                          0/1     PodInitializing     0          21s
kube-system   coredns-66bff467f8-52tkd                   0/1     Pending             0          7m5s
kube-system   coredns-66bff467f8-g5gjb                   0/1     ContainerCreating   0          7m5s
kube-system   etcd-controlplane                          1/1     Running             0          7m7s
kube-system   kube-apiserver-controlplane                1/1     Running             0          7m7s
kube-system   kube-controller-manager-controlplane       1/1     Running             0          7m7s
kube-system   kube-proxy-b2j4x                           1/1     Running             0          6m46s
kube-system   kube-proxy-s46lv                           1/1     Running             0          7m5s
kube-system   kube-scheduler-controlplane                1/1     Running             0          7m6s
master $ kubectl get nodes
NAME           STATUS   ROLES    AGE     VERSION
controlplane   Ready    master   7m30s   v1.18.0
node01         Ready    <none>   6m59s   v1.18.0
```

让我们探索一下 CNI 的配置，因为这是 Kubelet 设置网络所需的。
```yaml
master $ cd /etc/cni/net.d/
master $ ls
10-calico.conflist  calico-kubeconfig
master $
master $
master $ cat 10-calico.conflist
{
  "name": "k8s-pod-network",
  "cniVersion": "0.3.1",
  "plugins": [
    {
      "type": "calico",
      "log_level": "info",
      "log_file_path": "/var/log/calico/cni/cni.log",
      "datastore_type": "kubernetes",
      "nodename": "controlplane",
      "mtu": 1440,
      "ipam": {
          "type": "calico-ipam"
      },
      "policy": {
          "type": "k8s"
      },
      "kubernetes": {
          "kubeconfig": "/etc/cni/net.d/calico-kubeconfig"
      }
    },
    {
      "type": "portmap",
      "snat": true,
      "capabilities": {"portMappings": true}
    },
    {
      "type": "bandwidth",
      "capabilities": {"bandwidth": true}
    }
  ]
}
```

检查 CNI 的二进制文件。
```bash
master $ ls
bandwidth  bridge  calico  calico-ipam dhcp  flannel  host-device  host-local  install  ipvlan  loopback  macvlan  portmap  ptp  sample  tuning  vlan
master $
```

让我们安装 calicoctl 工具，从而更好地和 Calico 进行交互。

```bash
master $ cd /usr/local/bin/
master $ curl -O -L https://github.com/projectcalico/calicoctl/releases/download/v3.16.3/calicoctl
master $ chmod +x calicoctl
master $ export DATASTORE_TYPE=kubernetes
master $ export KUBECONFIG=~/.kube/config
# 检查端点，当我们没有部署任何 Pod 时将会是空的
master $ calicoctl get workloadendpoints
WORKLOAD   NODE   NETWORKS   INTERFACE
```

检查 BGP 对等节点状态，在 Master 节点上将会显示 Worker 节点。
```bash
master $ calicoctl node status
Calico process is running.
IPv4 BGP status
+--------------+-------------------+-------+----------+-------------+
| PEER ADDRESS |     PEER TYPE     | STATE |  SINCE   |    INFO     |
+--------------+-------------------+-------+----------+-------------+
| 172.17.0.40  | node-to-node mesh | up    | 00:24:04 | Established |
+--------------+-------------------+-------+----------+-------------+
```

创建一个 2 副本的 busybox Pod，并添加 toleration（容忍），允许 Pod 调度到 Master 节点上。
```yaml
cat > busybox.yaml <<"EOF"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: busybox-deployment
spec:
  selector:
    matchLabels:
      app: busybox
  replicas: 2
  template:
    metadata:
      labels:
        app: busybox
    spec:
      tolerations:
      - key: "node-role.kubernetes.io/master"
        operator: "Exists"
        effect: "NoSchedule"
      containers:
      - name: busybox
        image: busybox
        command: ["sleep"]
        args: ["10000"]
EOF
master $ kubectl apply -f busybox.yaml
deployment.apps/busybox-deployment created
```

获取 Pod 和 WorkloadEndpoints 状态。
```bash
master $ kubectl get pods -o wide
NAME                                 READY   STATUS    RESTARTS   AGE   IP                NODE           NOMINATED NODE   READINESS GATES
busybox-deployment-8c7dc8548-btnkv   1/1     Running   0          6s    192.168.196.131   node01         <none>           <none>
busybox-deployment-8c7dc8548-x6ljh   1/1     Running   0          6s    192.168.49.66     controlplane   <none>           <none>
master $ calicoctl get workloadendpoints
WORKLOAD                             NODE           NETWORKS             INTERFACE
busybox-deployment-8c7dc8548-btnkv   node01         192.168.196.131/32   calib673e730d42
busybox-deployment-8c7dc8548-x6ljh   controlplane   192.168.49.66/32     cali9861acf9f07
```

获取 Master 节点上 busybox Pod 的主机端 veth 对的详细信息。
```bash
master $ ifconfig cali9861acf9f07
cali9861acf9f07: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1440
        inet6 fe80::ecee:eeff:feee:eeee  prefixlen 64  scopeid 0x20<link>
        ether ee:ee:ee:ee:ee:ee  txqueuelen 0  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 5  bytes 446 (446.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

获取 Master 节点 busybox Pod 的接口地址，路由和 ARP 信息。
```bash
master $ kubectl exec busybox-deployment-8c7dc8548-x6ljh -- ifconfig
eth0      Link encap:Ethernet  HWaddr 92:7E:C4:15:B9:82
          inet addr:192.168.49.66  Bcast:192.168.49.66  Mask:255.255.255.255
          UP BROADCAST RUNNING MULTICAST  MTU:1440  Metric:1
          RX packets:5 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:446 (446.0 B)  TX bytes:0 (0.0 B)
lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)
master $ kubectl exec busybox-deployment-8c7dc8548-x6ljh -- ip route
default via 169.254.1.1 dev eth0
169.254.1.1 dev eth0 scope link
master $ kubectl exec busybox-deployment-8c7dc8548-x6ljh -- arp
```

查看 Master 节点的路由。
```bash
master $ ip route
default via 172.17.0.1 dev ens3
172.17.0.0/16 dev ens3 proto kernel scope link src 172.17.0.32
172.18.0.0/24 dev docker0 proto kernel scope link src 172.18.0.1 linkdown
blackhole 192.168.49.64/26 proto bird
192.168.49.65 dev calic22dbe57533 scope link
192.168.49.66 dev cali9861acf9f07 scope link # Master 节点上连接 busybox Pod 的 veth 接口
192.168.196.128/26 via 172.17.0.40 dev tunl0 proto bird onlink # 通往 Worker 节点上 Pod 的路由
```

尝试在 Master 节点的 Pod 上 ping Worker 节点的 Pod 以触发 ARP 请求。
```bash
master $ kubectl exec busybox-deployment-8c7dc8548-x6ljh -- ping 192.168.196.131 -c 1
PING 192.168.196.131 (192.168.196.131): 56 data bytes
64 bytes from 192.168.196.131: seq=0 ttl=62 time=0.823 ms

# 查看 ARP 条目
master $ kubectl exec busybox-deployment-8c7dc8548-x6ljh -- arp
? (169.254.1.1) at ee:ee:ee:ee:ee:ee [ether]  on eth0
```

网关的 MAC 地址就是 **cali9861acf9f07** 接口的。从现在开始，所有出访的流量都会直接打到内核，然后内核会根据路由将数据包传入 **tunl0** 接口。

ARP 代理的配置。
```bash
master $ cat /proc/sys/net/ipv4/conf/cali9861acf9f07/proxy_arp
1
```

**那么目的节点是如何处理数据包的？**

```bash
node01 $ ip route
default via 172.17.0.1 dev ens3
172.17.0.0/16 dev ens3 proto kernel scope link src 172.17.0.40
172.18.0.0/24 dev docker0 proto kernel scope link src 172.18.0.1 linkdown
192.168.49.64/26 via 172.17.0.32 dev tunl0 proto bird onlink # 通往 Master 节点上 Pod 的路由
blackhole 192.168.196.128/26 proto bird
192.168.196.129 dev calid4f00d97cb5 scope link
192.168.196.130 dev cali257578b48b6 scope link
192.168.196.131 dev calib673e730d42 scope link # Worker 节点上连接 busybox Pod 的 veth 接口
```

目的节点的内核收到数据包后，会根据路由表将数据包发往正确的 veth 接口。如果我们捕获数据包，我们可以看到网络上的 IP-IP 协议。使用  **tcpdump** 工具进行抓包：
- **-i**：抓包的接口，注意要在主机的接口，而不是在 tunl0 接口上抓包，在 tunl0 接口看到是还未封装前的数据包。
- **host**：根据 IP 地址过滤，IP-IP 外层的是地址是节点的 IP。
- **-nn**：不解析主机名或端口名，可以加快抓包的速度。
- **-w**：输出到文件。

**另外需要注意不要通过 ICMP 的方式过滤数据包，因为外层是 IP-IP 协议，内层才可以看到 ICMP 协议。**
```bash
tcpdump -i <节点接口> host <节点 IP> -nn -w /tmp/ipip.pcap
```

在 Wireshark 工具打开可以看到以下效果，下图我是在另一篇文章 [Calico Routing Modes](https://octetz.com/docs/2020/2020-10-01-calico-routing-modes) [4] 中截取的，图中的 IP 地址和本示例中的环境是不一致的，这里主要为了是方便读者看一下效果。可以看到，Pod 的 IP 通过 IP-IP 协议封装在节点的 IP 中。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220423195700.png)

Azure 不支持 IP-IP（据我所知）；因此，我们无法在那种环境中使用 IP-IP。最好禁用 IP-IP 以获得更好的性能。让我们尝试禁用它，看看效果如何。

## 演示 -- UnEncapMode
**禁用 IP-IP**：更改 ipPool 配置以禁用 IP-IP，先使用以下命令获取当前的配置。
```bash
master $ calicoctl get ippool default-ipv4-ippool -o yaml > ippool.yaml  
master $ vi ippool.yaml
```

编辑 ippool.yaml 文件，将 **ipipMode** 参数设置为 Never，然后使用 calicoctl 命令重新应用配置文件。
```bash
master $ calicoctl apply -f ippool.yaml
Successfully applied 1 'IPPool' resource(s)
```

重新检查路由。
```bash
master $ ip route
default via 172.17.0.1 dev ens3
172.17.0.0/16 dev ens3 proto kernel scope link src 172.17.0.32
172.18.0.0/24 dev docker0 proto kernel scope link src 172.18.0.1 linkdown
blackhole 192.168.49.64/26 proto bird
192.168.49.65 dev calic22dbe57533 scope link
192.168.49.66 dev cali9861acf9f07 scope link
192.168.196.128/26 via 172.17.0.40 dev ens3 proto bird # 通往 Worker 节点 Pod 的路由的出接口变成 ens33 了
```

路由的出接口不再是 **tunel0**，而是变成了 Master 节点的管理接口。

让我们尝试 ping Worker 节点的 Pod 并确保一切正常。从现在开始，将不再涉及任何 IPIP 协议。
```bash
master $ kubectl exec busybox-deployment-8c7dc8548-x6ljh -- ping 192.168.196.131 -c 1
PING 192.168.196.131 (192.168.196.131): 56 data bytes
64 bytes from 192.168.196.131: seq=0 ttl=62 time=0.653 ms
--- 192.168.196.131 ping statistics ---
1 packets transmitted, 1 packets received, 0% packet loss
round-trip min/avg/max = 0.653/0.653/0.653 ms
```

NoEncapMode 模式下要求集群的节点在**同一网段**内才可以保证 Pod 之间的正常通信。因为如果跨网段的话，没有在 Pod IP 的外部封装节点 IP 的情况下，网关设备是不知道 Pod 的网段的，将会丢弃数据包。使用  **tcpdump** 工具抓包分析，由于没有额外的封装，可以直接通过 ICMP 协议进行过滤。
```bash
tcpdump -i <节点接口> icmp -nn -w /tmp/noencapmode.pcap
```

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220423195756.png)

Calico 可以选择仅封装跨子网边界的流量，建议在 IP-IP 或者 VXLAN 模式中使用 `CrossSubnet` 选择，以最大限度地减少封装开销，配置详情参见：[Calico Overlay networking](https://projectcalico.docs.tigera.io/networking/vxlan-ipip) [5] 。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220423195832.png)
## 演示 -- VXLAN
重新初始化集群并下载 **calico.yaml** 文件，然后修改以下内容。

1. 从 **_livenessProbe_** 和 **_readinessProbe_** 中移除 **bird**。因为在第 2 步中禁用 BIRD 会导致健康探测失败。
```yaml
livenessProbe:
            exec:
              command:
              - /bin/calico-node
              - -felix-live
              #- -bird-live # 注释这条
            periodSeconds: 10
            initialDelaySeconds: 10
            failureThreshold: 6
          readinessProbe:
            exec:
              command:
              - /bin/calico-node
              - -felix-ready
              #- -bird-ready # 注释这条

```

2.修改 calico_backend 参数为 **vxlan**，表示禁用 BIRD，因为我们不再需要 BGP。
```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: calico-config
  namespace: kube-system
data:
  # Typha is disabled.
  typha_service_name: "none"
  # Configure the backend to use.
  calico_backend: "vxlan" # 修改为 vxlan
```

3.禁用 IPIP。
```yaml
# Enable IPIP
- name: CALICO_IPV4POOL_IPIP
    value: "Never" # 将参数设置为 Never 禁用 IPIP
# Enable or Disable VXLAN on the default IP pool.
- name: CALICO_IPV4POOL_VXLAN
    value: "Never"
```

修改完毕后应用配置文件。
```yaml
$ kubectl apply -f calico.yaml
```

查看 Master 节点的路由和接口。
```bash
master $ ip route
default via 172.17.0.1 dev ens3
172.17.0.0/16 dev ens3 proto kernel scope link src 172.17.0.15
172.18.0.0/24 dev docker0 proto kernel scope link src 172.18.0.1 linkdown
192.168.49.65 dev calif5cc38277c7 scope link
192.168.49.66 dev cali840c047460a scope link
192.168.196.128/26 via 192.168.196.128 dev vxlan.calico onlink # 通往 Worker 节点 Pod 的路由走 vxlan.calico 接口

# 多了一个 vxlan.calico 接口用于封装和解封装 VXLAN 流量
master $ ifconfig
vxlan.calico: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1440
        inet 192.168.196.128  netmask 255.255.255.255  broadcast 192.168.196.128
        inet6 fe80::64aa:99ff:fe2f:dc24  prefixlen 64  scopeid 0x20<link>
        ether 66:aa:99:2f:dc:24  txqueuelen 0  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 11 overruns 0  carrier 0  collisions 0
```

查看 Pod 状态。
```bash
master $ kubectl get pods -o wide
NAME                                 READY   STATUS    RESTARTS   AGE   IP                NODE           NOMINATED NODE   READINESS GATES
busybox-deployment-8c7dc8548-8bxnw   1/1     Running   0          11s   192.168.49.67     controlplane   <none>           <none>
busybox-deployment-8c7dc8548-kmxst   1/1     Running   0          11s   192.168.196.130   node01         <none>           <none>
```

查看 Pod 的路由。
```bash
master $ kubectl exec busybox-deployment-8c7dc8548-8bxnw -- ip route
default via 169.254.1.1 dev eth0
169.254.1.1 dev eth0 scope link
```

发起 ping 命令触发 ARP 请求。
```bash
master $ kubectl exec busybox-deployment-8c7dc8548-8bxnw -- arp
master $ kubectl exec busybox-deployment-8c7dc8548-8bxnw -- ping 8.8.8.8
PING 8.8.8.8 (8.8.8.8): 56 data bytes
64 bytes from 8.8.8.8: seq=0 ttl=116 time=3.786 ms
^C
master $ kubectl exec busybox-deployment-8c7dc8548-8bxnw -- arp
? (169.254.1.1) at ee:ee:ee:ee:ee:ee [ether]  on eth0
master $
```


![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220422150853.png)
和前面介绍的 IP-IP 模式的概念类似，唯一的区别是数据包到达 vxlan.calico 接口后，会在数据包的外层封装节点 IP 和 MAC 地址。此外，VXLAN 协议使用 UDP 4789 端口。使用  **tcpdump** 工具抓包分析，可以在节点接口上根据 VXLAN 的 4789 端口进行过滤。
```bash
tcpdump -i <节点接口> port 4789 -nn -w /tmp/vxlan.pcap
```

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220423195819.png)

> 注意: VXLAN 能够支持在某些 IP-IP 不支持的环境（例如 Azure）。和 IP-IP 模式相比，由于 VXLAN 封装数据包所使用的标头更大，因此会消耗更多的资源。除非你运行网络密集型的工作负载，否则通常不会注意到两者间性能的差异。


## 参考资料
- [1] 原文链接：https://dramasamy.medium.com/life-of-a-packet-in-kubernetes-part-2-a07f5bf0ff14
- [2] Component architecture: https://projectcalico.docs.tigera.io/reference/architecture/overview
- [3] BGP Route Reflection: https://datatracker.ietf.org/doc/html/rfc4456
- [4] Calico Routing Modes:  https://octetz.com/docs/2020/2020-10-01-calico-routing-modes/
- [5] Calico Overlay networking:  https://projectcalico.docs.tigera.io/networking/vxlan-ipip
- [6] Calico 网络通信原理揭秘: https://zhuanlan.zhihu.com/p/75933393
- [7] 什么是VXLAN: https://support.huawei.com/enterprise/zh/doc/EDOC1100087027#ZH-CN_TOPIC_0254803606
- [8] 一文明白calico的IPIP网络模式: https://network.51cto.com/article/660965.html
- [9] 使用 Go 从零开始实现 CNI：https://morven.life/posts/create-your-own-cni-with-golang/
- [10] Switching from IP-in-IP to VXLAN： https://projectcalico.docs.tigera.io/getting-started/kubernetes/installation/config-options#customizing-calico-manifests
- [11] Troubleshooting Calico:  https://github.com/apprenda/kismatic/blob/master/docs/troubleshooting-calico.md
- [12] The Calico datastore:  https://projectcalico.docs.tigera.io/getting-started/kubernetes/hardway/the-calico-datastore

## 欢迎关注
![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220104221116.png)
