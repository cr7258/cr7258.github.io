---
title: Kubernetes 中数据包的生命周期 -- 第 1 部分
author: Se7en
date: 2023/08/01 22:36
categories:
 - 翻译
tags:
 - Kubernetes
---

# Kubernetes 中数据包的生命周期 -- 第 1 部分

> 本文翻译自：[Life of a Packet in Kubernetes — Part 1 [1]](https://medium.com/@dramasamy/life-of-a-packet-in-kubernetes-part-1-f9bc0909e051)<br>
作者：Dinesh Kumar Ramasamy<br>
本文在原文的基础上做了适当的修改，如有疑问请查阅原文。

Kubernetes 集群中的网络可能会令人感到有点困惑，即便是对于拥有虚拟网络和路由实践经验的工程师来说也是如此。本系列文章将分为 4 个部分，帮助你理解基本的 Kubernetes 网络，本文属于第 1 部分。
- Part 1
    - 1.Linux 命名空间（Namespaces）
    - 2.容器网络（Network Namespace）
    - 3.什么是 CNI？
    - 4.Pod 网络命名空间
- Part 2
    - 1.Calico CNI
- Part 3
    - 1.Pod-to-Pod
    - 2.Pod-to-External
    - 3.Pod-to-Service
    - 4.External-to-Pod
    - 5.External Traffic Policy
    - 6.Kube-Proxy
    - 7.iptable rules processing flow
    - 8.Network Policy basics
- Part 4
    - 1.Ingress Controller
    - 2.Ingress Resources Example
    - 3.Nginx
    - 4.Envoy+Contour
    - 5.Ingress with MetalLB

## Linux 命名空间（Namespaces）
Linux namespace 包含了大多数现代容器实现背后的一些基本技术。从高层次来看，它们允许在独立的进程之间隔离全局系统资源。例如，PID namespace 隔离了进程 ID，这意味着在同一主机上运行的两个进程可以具有相同的 PID！

这种隔离级别显然在容器领域非常有用。假如没有 namespace 技术，在容器 A 中运行的进程甚至可以 umount 容器 B 中重要的文件系统，或更改容器 C 中的主机名，或从容器 D 中删除网络接口，这将会非常危险！当通过 namespace 技术隔离这些资源后，容器 A 中的进程甚至不知道容器 B, C, D 中进程的存在，这样进程之间进行的操作，都不会互相干扰，安全性可以得到保障。
- 1.**Mount** -- 隔离文件系统挂载点。
- 2.**UTS** -- 隔离主机名和域名。
- 3.**IPC** -- 隔离进程间通信资源。
- 4.**PID** -- 隔离进程 ID。
- 5.**Network** -- 隔离网络资源。
- 6.**User** -- 隔离用户和用户组。
- 7.**Cgroup** -- 隔离 Cgroups 根目录。

大多数容器实现都使用上述的 namespace，以便在不同的容器进程之间提供最高级别的隔离。由于 Cgroup namespace 比其他 namespace 技术出现得稍晚一些，因此尚未被广泛使用。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220420152147.png)

## 容器网络（Network Namespace）
在我们开始了解 CNI 和 Docker 提供的各种功能之前，让我们探索一下驱动容器网络的核心技术。Linux 内核已经具有在主机上实现多租户的各种功能。namespace 为不同类型的资源提供了隔离的功能，其中 network namespace 提供了网络资源的隔离。
在 Linux 操作系统中，可以很容易地使用 **ip** 命令创建 network namespace。让我们创建两个不同的 network namespace，并分别将它们命名为 client 和 server。
```bash
master# ip netns add client  
master# ip netns add server  
master# ip netns list  
server  
client
```

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220420153805.png)

创建一个 **veth** 对来连接这两个 network namespace，**veth** 对可以看作是一根网线。
```bash
master# ip link add veth-client type veth peer name veth-server
master# ip link list | grep veth
4: veth-server@veth-client: <BROADCAST,MULTICAST,M-DOWN> mtu 1500 qdisc noop state DOWN mode DEFAULT group default qlen 1000
5: veth-client@veth-server: <BROADCAST,MULTICAST,M-DOWN> mtu 1500 qdisc noop state DOWN mode DEFAULT group default qlen 1000
```

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220420154101.png)

当前 **veth** 对在主机的 network namespace 中，现在让我们将 **veth** 对的两端分别接在前面创建的两个 namespace 中。
```bash
master# ip link set veth-client netns client  
master# ip link set veth-server netns server  
master# ip link list | grep veth # 此时 veth 对不在主机的 network namespace 中了
```
![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220420155049.png)

让我们验证 namespace 中确实存在 **veth** 对，首先从 **client** namespace 开始。
```bash
master# ip netns exec client ip link
1: lo: <LOOPBACK> mtu 65536 qdisc noop state DOWN mode DEFAULT group default qlen 1
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
5: veth-client@if4: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN mode DEFAULT group default qlen 1000
    link/ether ca:e8:30:2e:f9:d2 brd ff:ff:ff:ff:ff:ff link-netnsid 1
```
接着确认 **server** namespace。
```bash
master# ip netns exec server ip link
1: lo: <LOOPBACK> mtu 65536 qdisc noop state DOWN mode DEFAULT group default qlen 1
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
4: veth-server@if5: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN mode DEFAULT group default qlen 1000
    link/ether 42:96:f0:ae:f0:c5 brd ff:ff:ff:ff:ff:ff link-netnsid 0
```
现在让我们为这些接口分配 IP 地址并启用它们。
```bash
master# ip netns exec client ip address add 10.0.0.11/24 dev veth-client
master# ip netns exec client ip link set veth-client up
master# ip netns exec server ip address add 10.0.0.12/24 dev veth-server
master# ip netns exec server ip link set veth-server up
master# ip netns exec client ip addr
1: lo: <LOOPBACK> mtu 65536 qdisc noop state DOWN group default qlen 1
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
5: veth-client@if4: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether ca:e8:30:2e:f9:d2 brd ff:ff:ff:ff:ff:ff link-netnsid 1
    inet 10.0.0.11/24 scope global veth-client
       valid_lft forever preferred_lft forever
    inet6 fe80::c8e8:30ff:fe2e:f9d2/64 scope link
       valid_lft forever preferred_lft forever

master# ip netns exec server ip addr
1: lo: <LOOPBACK> mtu 65536 qdisc noop state DOWN group default qlen 1
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
4: veth-server@if5: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 42:96:f0:ae:f0:c5 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 10.0.0.12/24 scope global veth-server
       valid_lft forever preferred_lft forever
    inet6 fe80::4096:f0ff:feae:f0c5/64 scope link
       valid_lft forever preferred_lft forever
```

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220420155747.png)

使用 ping 命令，我们可以验证两个 network namespace 已经连接并且可以访问。
```bash
master# ip netns exec client ping 10.0.0.12  
PING 10.0.0.12 (10.0.0.12) 56(84) bytes of data.  
64 bytes from 10.0.0.12: icmp_seq=1 ttl=64 time=0.101 ms  
64 bytes from 10.0.0.12: icmp_seq=2 ttl=64 time=0.072 ms  
64 bytes from 10.0.0.12: icmp_seq=3 ttl=64 time=0.084 ms  
64 bytes from 10.0.0.12: icmp_seq=4 ttl=64 time=0.077 ms  
64 bytes from 10.0.0.12: icmp_seq=5 ttl=64 time=0.079 ms
```

如果我们想创建更多的 network namespace 并将它们连接在一起，那么为每个 namespace 创建一个 **veth** 对可能不是一个可扩展的解决方案。相反，可以创建一个 Linux 网桥并将这些 network namespace 连接到网桥实现互通。这正是 Docker 在同一主机上运行的容器之间建立网络的方式！
让我们创建 namespace 并将其添加到网桥中，**BR** 和 **HOST_IP** 两个变量根据主机的实际情况进行修改。
```bash
# 变量
BR=bridge1 # 网桥名字
HOST_IP=172.17.0.33  # 主机地址

# 创建 veth 对
ip link add client1-veth type veth peer name client1-veth-br  
ip link add server1-veth type veth peer name server1-veth-br  

# 创建网桥
ip link add $BR type bridge  

# 创建 network namespace
ip netns add client1  
ip netns add server1

# 连接 veth 对与 network namespace 
ip link set client1-veth netns client1  
ip link set server1-veth netns server1

# 连接 veth 对的另一端与网桥
ip link set client1-veth-br master $BR  
ip link set server1-veth-br master $BR

# 启用网桥，接口
ip link set $BR up  
ip link set client1-veth-br up  
ip link set server1-veth-br up  
ip netns exec client1 ip link set client1-veth up  
ip netns exec server1 ip link set server1-veth up

# 为接口添加 IP 地址
ip netns exec client1 ip addr add 172.30.0.11/24 dev client1-veth  
ip netns exec server1 ip addr add 172.30.0.12/24 dev server1-veth   
ip addr add 172.30.0.1/24 dev $BR  
```

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220420161407.png)

使用 ping 命令，我们可以验证两个 network namespace 已经连接并且可以访问。
```bash
controlplane $ ip netns exec client1 ping 172.30.0.12 -c 5  
PING 172.30.0.12 (172.30.0.12) 56(84) bytes of data.  
64 bytes from 172.30.0.12: icmp_seq=1 ttl=64 time=0.138 ms  
64 bytes from 172.30.0.12: icmp_seq=2 ttl=64 time=0.091 ms  
64 bytes from 172.30.0.12: icmp_seq=3 ttl=64 time=0.073 ms  
64 bytes from 172.30.0.12: icmp_seq=4 ttl=64 time=0.070 ms  
64 bytes from 172.30.0.12: icmp_seq=5 ttl=64 time=0.107 ms
```

如果上面的 ping 命令不通可能是由于 Docker 将 iptables 的 FORWARD 链默认动作设置为 DROP，参见 [Docker 官网 [2]](https://docs.docker.com/network/iptables/#docker-on-a-router)。 可以使用以下命令将 FORWARD 设置为 ACCEPT。
```bash
iptables -P FORWARD ACCEPT 
```
让我们从 namespace 中 ping 主机地址。
```bash
controlplane $ ip netns exec client1 ping $HOST_IP -c 2  
connect: Network is unreachable # 网络不可达
```
收到了“网络不可以达“的响应，这是因为在新创建的 namespace 中没有配置路由。让我们添加一条默认路由。
```bash
controlplane $ ip netns exec client1 ip route add default via 172.30.0.1
controlplane $ ip netns exec server1 ip route add default via 172.30.0.1
controlplane $ ip netns exec client1 ping $HOST_IP -c 5
PING 172.17.0.23 (172.17.0.23) 56(84) bytes of data.
64 bytes from 172.17.0.23: icmp_seq=1 ttl=64 time=0.053 ms
64 bytes from 172.17.0.23: icmp_seq=2 ttl=64 time=0.121 ms
64 bytes from 172.17.0.23: icmp_seq=3 ttl=64 time=0.078 ms
64 bytes from 172.17.0.23: icmp_seq=4 ttl=64 time=0.129 ms
64 bytes from 172.17.0.23: icmp_seq=5 ttl=64 time=0.119 ms
--- 172.17.0.23 ping statistics ---
5 packets transmitted, 5 received, 0% packet loss, time 3999ms
rtt min/avg/max/mdev = 0.053/0.100/0.129/0.029 ms
```
现在通往外部的默认路由指向了网桥，因此在 namespace 中可以访问任何外部服务。
```bash
controlplane $ ping 8.8.8.8 -c 2
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=3.40 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=117 time=3.81 ms
--- 8.8.8.8 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1001ms
rtt min/avg/max/mdev = 3.403/3.610/3.817/0.207 ms
```

**那么如何从外部访问私有网络呢？**
如你所见，我们演示的机器已经安装了 Docker，并且 Docker 自动创建了一个名为 **docker0** 的网桥。在 network namespace 中运行 Web 服务并不容易，因为所有的 Linux namespace 都需要互通以模拟这种情况。让我们使用 Docker 来模拟场景。
```bash
docker0   Link encap:Ethernet  HWaddr 02:42:e2:44:07:39
          inet addr:172.18.0.1  Bcast:172.18.0.255  Mask:255.255.255.0
          UP BROADCAST MULTICAST  MTU:1500  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)
```
现在让我们启动一个 Nginx 容器并查看它。
```bash
# 启动 Nginx 容器
controlplane $ docker run -d --name web --rm nginx  
efff2d2c98f94671f69cddc5cc88bb7a0a5a2ea15dc3c98d911e39bf2764a556  
# 获取容器 IP
controlplane $ WEB_IP=`docker inspect -f "{{ .NetworkSettings.IPAddress }}" web`  
# 获取容器的 network namespace
controlplane $ docker inspect web --format '{{ .NetworkSettings.SandboxKey }}'  
/var/run/docker/netns/c009f2a4be71
```

由于 Docker 不会在默认位置（*var/run/netns/* 目录）创建 **netns**，因此 **ip netns list** 命令不会显示这个 network namespace。我们可以创建符号连接指向预期位置来解决。
```bash
controlplane $ container_id=web  
controlplane $ container_netns=$(docker inspect ${container_id} --format '{{ .NetworkSettings.SandboxKey }}')  
controlplane $ mkdir -p /var/run/netns  
controlplane $ rm -f /var/run/netns/${container_id}  
controlplane $ ln -sv ${container_netns} /var/run/netns/${container_id}  
'/var/run/netns/web' -> '/var/run/docker/netns/c009f2a4be71'  
controlplane $ ip netns list  
web (id: 3)  # 容器的 network namespace
server1 (id: 1)  
client1 (id: 0)
```

让我们检查一下 web namespace 中的 IP 地址。
```bash
controlplane $ ip netns exec web ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
11: eth0@if12: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default
    link/ether 02:42:ac:12:00:03 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 172.18.0.3/24 brd 172.18.0.255 scope global eth0
       valid_lft forever preferred_lft forever
```

让我们检查一下 Docker 容器中的 IP 地址。
```bash
controlplane $ WEB_IP=`docker inspect -f "{{ .NetworkSettings.IPAddress }}" web`
controlplane $ echo $WEB_IP
172.18.0.3
```

很明显，Docker 使用了所有的 Linux namespace 并将容器与主机隔离开来。让我们尝试从主机访问运行在 web namespace 中的 Web 服务。
```bash
controlplane $ curl $WEB_IP
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>
<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>
<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

是否可以从外部网络访问这个 Web 服务呢？是的，需要添加端口转发。
```bash
controlplane $ iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination $WEB_IP:80  
controlplane $ echo $HOST_IP  
172.17.0.23
```

让我们尝试在外部主机访问 Web 服务。

```bash
node01 $ curl 172.17.0.23
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>
<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>
<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220420170033.png)

CNI 插件执行上述的命令（不完全是，但类似）来设置 loopback 接口，eth0 接口，并将 IP 地址分配给容器。容器运行时（例如 Kubernetes，Podman 等等）利用 CNI 来设置 Pod 网络。让我们在下一个章节讨论 CNI。

## 什么是 CNI？
CNI 插件负责将网络接口接入容器的 network namespace（例如 veth 对的一端）并在主机上进行任何必要的更改（例如将 veth 的另一端连接到网桥中）。然后调用合适的 IPAM 插件为接口分配 IP 地址并设置路由。

**等等，似曾相识？** 是的，我们已经在**容器网络**章节中提到了这一点。

CNI (Container Network Interface，容器网络接口) 是一个 Cloud Native Computing Foundation（云原生计算基金会）的项目，由一系列规范和库组成，用于编写配置 Linux 容器网络的插件。由于 CNI 规范专注于容器的网络连接，并且易于实现，因此得到了广泛的支持。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220420172228.png)

详情参见：[CNI 规范 [3]](https://github.com/containernetworking/cni/blob/master/SPEC.md)。以下是我在第一次通读时发现的一些有趣的点：
- 规范中将容器定义为 Linux network namespace。我们应该对这个定义感到满意，因为像 Docker 这样的容器运行时会为每个容器创建一个新的 network namespace。
- 网络配置由 JSON 对象组成。
- 网络配置通过 STDIN 输入流的方式传递给插件，也就是说主机上没有用于网络配置的文件。
- 其他参数通过环境变量传递给插件。
- CNI 插件被实现为一个可执行文件。
- CNI 插件负责连接容器，也就是说它需要将容器接入网络。
- CNI 插件负责调用 IPAM 插件为容器分配 IP 地址并设置路由。

让我们尝试在没有 Kubernetes 的情况下手动模拟 Pod 的创建，并通过 CNI 插件分配 IP 地址。
第 1 步：下载 CNI 插件。
```bash
controlplane $ mkdir cni  
controlplane $ cd cni  
controlplane $ curl -O -L https://github.com/containernetworking/cni/releases/download/v0.4.0/cni-amd64-v0.4.0.tgz  
controlplane $ tar -xvf cni-amd64-v0.4.0.tgz  
./  
./macvlan  
./dhcp  
./loopback  
./ptp  
./ipvlan  
./bridge  
./tuning  
./noop  
./host-local  
./cnitool  
./flannel  
```
第 2 步：创建 JSON 格式的 CNI 配置。
```bash
cat > /tmp/00-demo.conf << EOF 
{
    "cniVersion": "0.2.0",
    "name": "demo_br",
    "type": "bridge",
    "bridge": "cni_net0",
    "isGateway": true,
    "ipMasq": true,
    "ipam": {
        "type": "host-local",
        "subnet": "10.0.10.0/24",
        "routes": [
            { "dst": "0.0.0.0/0" },
            { "dst": "1.1.1.1/32", "gw":"10.0.10.1"}
        ]
    }
}
EOF
```

CNI 的配置参数如下：
```bash
-:CNI 通用参数:-
cniVersion: 定义 CNI 的版本。
name: 网络名称。
type: 使用的插件名称。在本例中, 是插件可执行文件的名称。
args: 可选的附加参数。
ipMasq: 为网络配置源地址转换（SNAT）。
ipam:
    type: IPAM 插件名称。
    subnet: 分配的子网。
    routes:
        dst: 目的网段。
        gw: 去往目的网段的下一跳地址，如果没有指定则使用子网的默认网关。
dns:
    nameservers: DNS服务器列表。
    domain: DNS 请求的搜索域。
    search: DNS 请求的搜索域列表。
    options: 传递给接收者的选项列表。
```

第 3 步：创建一个具有 **none** 网络类型的容器，这样容器就不会使用任何 IP 地址。你可以使用任何镜像来创建容器，这里我使用 **pause** 容器来模拟 Kubernetes。
```bash
# 创建容器
controlplane $ docker run --name pause_demo -d --rm --network none kubernetes/pause

# 将 Docker 创建的 network namespace 文件软连接到默认路径
controlplane $ container_id=pause_demo
controlplane $ container_netns=$(docker inspect ${container_id} --format '{{ .NetworkSettings.SandboxKey }}')
controlplane $ mkdir -p /var/run/netns
controlplane $ rm -f /var/run/netns/${container_id}
controlplane $ ln -sv ${container_netns} /var/run/netns/${container_id}
'/var/run/netns/pause_demo' -> '/var/run/docker/netns/0297681f79b5'

# 查看 network namespace
controlplane $ ip netns list
pause_demo

# 查看容器接口
controlplane $ ip netns exec $container_id ifconfig
lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)
```

第 4 步：用配置文件执行 CNI 插件。
```bash
controlplane $ CNI_CONTAINERID=$container_id \
CNI_IFNAME=eth10 CNI_COMMAND=ADD \
CNI_NETNS=/var/run/netns/$container_id \
CNI_PATH=`pwd` ./bridge < /tmp/00-demo.conf

# 返回结果，第一次执行该命令会报错，容器网络仍然会设置成功
# /var/lib/cni/networks/demo_br/last_reserved_ip 文件用于记录已经分配的 IP 地址
# 第一次执行以后会自动生成该文件，后续执行就不会报错了
2020/10/17 17:32:37 Error retriving last reserved ip: Failed to retrieve last reserved ip: open /var/lib/cni/networks/demo_br/last_reserved_ip: no such file or directory
{
    "ip4": {
        "ip": "10.0.10.2/24",
        "gateway": "10.0.10.1",
        "routes": [
            {
                "dst": "0.0.0.0/0"
            },
            {
                "dst": "1.1.1.1/32",
                "gw": "10.0.10.1"
            }
        ]
    },
    "dns": {}
}
```
-   **CNI_COMMAND=ADD** — 操作（可选值: ADD/DEL/CHECK）
-   **CNI_CONTAINER=pause_demo** — 我们告诉 CNI 插件在名为 **pause_demo** 的 network namespace 进行操作。
-   **CNI_NETNS=/var/run/netns/pause_demo** — namespace 文件所在的路径。
-   **CNI_IFNAME=eth10** — 希望在容器中设置的网络接口名称。
-   **CNI_PATH=`pwd`** — 告诉 CNI 插件可执行文件所在的路径，由于我们当前正好在 CNI 插件的目录中，因此可以使用 `pwd` 获取路径。

> 我强烈建议你阅读 CNI 规范以获取有关插件及其功能的更多信息。你可以在同一个 JSON 文件中使用多个插件执行一系列操作，例如添加防火墙规则等等。

第 5 步：运行上述命令会返回一些内容。首先，会返回一个错误，因为 IPAM 驱动程序找不到它用来在本地存储 IP 信息的文件。如果我们为不同的 network namespace 再次运行该命令时，将不会收到此错误，因为该文件是在第一次运行插件时创建的。其次，我们可以得到一个 JSON 对象，表明了插件配置的相关 IP 配置。在本例中，网桥的 IP 地址应当被设置为 10.0.10.1/24，容器接口的 IP 地址应当被设置为 10.0.10.2/24，在容器中还添加了我们在 JSON 配置文件中定义的默认路由和 1.1.1.1/32 的路由。让我们看看它做了什么。
```bash
controlplane $ ip netns exec pause_demo ifconfig
eth10     Link encap:Ethernet  HWaddr 0a:58:0a:00:0a:02
          inet addr:10.0.10.2  Bcast:0.0.0.0  Mask:255.255.255.0
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:18 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:1476 (1.4 KB)  TX bytes:0 (0.0 B)
lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)
controlplane $ ip netns exec pause_demo ip route
default via 10.0.10.1 dev eth10
1.1.1.1 via 10.0.10.1 dev eth10
10.0.10.0/24 dev eth10  proto kernel  scope link  src 10.0.10.2
```

第 6 步：启动 Web 服务容器与 **pause** 容器共享 namespace。
```bash
controlplane $ docker run --name web_demo -d --rm --network container:$container_id nginx
8fadcf2925b779de6781b4215534b32231685b8515f998b2a66a3c7e38333e30
```

第 7 步：使用 pause 容器的 IP 地址来访问 Web 服务。
```bash
controlplane $ curl `cat /var/lib/cni/networks/demo_br/last_reserved_ip`
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>
<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>
<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

现在让我们看看下一节中 Pod 的定义。

## Pod 网络命名空间
在 Kubernetes 中首先要理解的是，**Pod** 实际上并不等同于容器，而是容器的集合。并且这些同一个集合的容器都共享一个网络堆栈。Kubernetes 通过在 **pause** 容器上设置网络来进行管理，你可以在创建的每个 Pod 中找到它。pause 容器本身只负责提供网络，所有其他的容器都连接到 pause 容器所在的网络。因此，在同一个 Pod 中的一个容器也可以通过 localhost 与另一个容器中的服务进行通信。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220420205102.png)

## 参考资料
- [1] 原文链接: https://medium.com/@dramasamy/life-of-a-packet-in-kubernetes-part-1-f9bc0909e051
- [2] Docker 官网: https://docs.docker.com/network/iptables/#docker-on-a-router
- [3] CNI 规范: https://github.com/containernetworking/cni/blob/master/SPEC.md
