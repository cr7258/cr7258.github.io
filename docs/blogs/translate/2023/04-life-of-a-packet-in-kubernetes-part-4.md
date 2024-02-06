---
title: Kubernetes 中数据包的生命周期 -- 第 4 部分
author: Se7en
date: 2023/08/01 22:36
categories:
 - 翻译
tags:
 - Kubernetes
---

# Kubernetes 中数据包的生命周期 -- 第 4 部分

> 本文翻译自：[Life of a Packet in Kubernetes — Part 4 [1]](https://dramasamy.medium.com/life-of-a-packet-in-kubernetes-part-4-4dbc5256050a)<br>
作者：Dinesh Kumar Ramasamy<br>
本文在原文的基础上做了适当的修改，如有疑问请查阅原文。

本文是 Kubernetes 中数据包的生命周期系列文章的第 4 部分，我们将会介绍 Kubernetes 中的 `Ingress` 资源对象和 Ingress Controller。Ingress Controller 是一个控制器，它监视 Kubernetes API Server 对 Ingress 资源的变更并相应地更新负载均衡器的配置。

## 1 Nginx Controller 和 LoadBalancer/Proxy

Ingress Controller 通常是以 Pod 的形式运行在 Kubernetes 集群中，它根据 Ingress 资源配置负载均衡器。负载均衡器可以是运行在集群中的软件负载均衡器，也可以是在外部运行的硬件或云负载均衡器。不同的负载均衡器需要使用不同的 Ingress Controller。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220514235738.png)

`Ingress` 本质上是 Kubernetes 对反向代理的一个高级抽象，描述了一系列流量管理的方法，特别是针对 HTTP(S)。通过 `Ingress`，我们可以定义路由转发的规则，而无需创建一堆负载均衡器或在每个节点上暴露服务。可以为服务提供外部可访问的 URLs，流量的负载均衡，SSL/TLS 终结，并提供基于名称的虚拟主机和基于内容的路由。

## 2 配置选项
在 Kubernetes 中使用 Ingress Class 标记 Ingress 资源对象所属的 Ingress Controller。这允许多个 Ingress Controller 在同一个 Kubernetes 集群中共存，每个 Ingress Controller 只会处理属于它的配置。

**基于前缀的路由**
 ```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: prefix-based
  annotations:
    kubernetes.io/ingress.class: "nginx-ingress-inst-1" # 标记所属的 Ingress Controller
spec:
  rules:
  - http:
      paths:
      - path: /video
        pathType: Prefix
        backend:
          service:
            name: video
            port:
              number: 80
      - path: /store
        pathType: Prefix
        backend:
          service:
            name: store
            port:
              number: 80
 ```

在 Kubernetes 1.18 版本引入 IngressClass 资源和 `ingressClassName` 字段之前，Ingress Class 是通过 Ingress 中的一个 `kubernetes.io/ingress.class` 注解来指定的。 这个注解从未被正式定义过，但是得到了 Ingress Controller 的广泛支持。

Ingress 中新的 `ingressClassName` 字段是该注解的替代品，但并非完全等价。该注解通常用于引用实现该 Ingress 的控制器的名称，而这个新的字段则是对一个包含额外 Ingress 配置的 IngressClass 资源的引用，包括 Ingress Controller 的名称。

  ```yaml
# IngressClass 资源
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  labels:
    app.kubernetes.io/component: controller
  name: nginx-ingress-inst-1 # IngressClass 名字
  annotations:
    ingressclass.kubernetes.io/is-default-class: "true" # 设置为默认的 IngressClass，当 Ingress 中没有设置 ingressClassName 字段或者 kubernetes.io/ingress.class 注解时将会使用这个 IngressClass
spec:
  controller: k8s.io/ingress-nginx
---
# 在 Ingress 中指定 ingressClassName
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: prefix-based
spec:
  ingressClassName: "nginx-ingress-inst-1" # 标记所属的 Ingress，引用 IngressClass 资源
  rules:
  - http:
      paths:
      - path: /video
        pathType: Prefix
        backend:
          service:
            name: video
            port:
              number: 80
      - path: /store
        pathType: Prefix
        backend:
          service:
            name: store
            port:
              number: 80
 ```

**基于主机的路由**
 ```yaml
 apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: host-based
  annotations:
    kubernetes.io/ingress.class: "nginx-ingress-inst-1"
spec:
  rules:
  - host: "video.example.com" # 域名
    http:
      paths:
      - pathType: Prefix
        path: "/"
        backend:
          service:
            name: video
            port:
              number: 80
  - host: "store.example.com"
    http:
      paths:
      - pathType: Prefix
        path: "/"
        backend:
          service:
            name: store
            port:
              number: 80
 ```

**基于主机 + 前缀的路由**
 ```yaml
 apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: host-prefix-based
  annotations:
    kubernetes.io/ingress.class: "nginx-ingress-inst-1"
spec:
  rules:
  - host: foo.com
    http:
      paths:
      - backend:
          serviceName: foovideo
          servicePort: 80
        path: /video
      - backend:
          serviceName: foostore
          servicePort: 80
        path: /store
  - host: bar.com
    http:
      paths:
      - backend:
          serviceName: barvideo
          servicePort: 80
        path: /video
      - backend:
          serviceName: barstore
          servicePort: 80
        path: /store
 ```


Ingres 是 Kubernetes 的内置对象，为了让 Ingress 资源工作，集群中必须有一个正在运行的 Ingress Controller。Ingress Controller 需要实现 Ingress API 的相关接口。社区中有很多 Ingress Controller 的实现，本文将会介绍 **Nginx** 和 **Contour**。

前文提到，Kubernetes Ingress 是一个 API 对象，它描述了如何对外发布部署在 Kubernetes 集群中的服务。因此，要使 Ingress Controller 能够工作，你需要实现 Ingress API 来读取和处理 Ingress 资源的信息。

Ingress API 对象只是元数据信息，真正的工作是由 Ingress Controller 来完成的。有许多 [Ingress Controller [2]](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/#additional-controllers) 可供使用，重要是根据具体场景选择合适的 Ingress Controller。

也可以在同一个集群中部署多个 Ingress Controller，并为每个 Ingress 设置所属的 Ingress Controller。通常，我们会针对同一集群中的不同场景组合使用这些控制器。例如，我们可能有一个控制器用于处理进入集群的外部流量，其中包括与 SSL 证书的绑定，而另一个没有 SSL 绑定的控制器用于处理集群内的流量。

## 3 部署选项
### 3.1 Contour + Envoy

Contour Ingress Controller 包含以下两部分：
- Envoy（数据平面），提供高性能反向代理。
- Contour（控制平面），读取 Ingress 资源信息并对 Envoy 进行配置。

Contour 和 Envoy 容器是分开部署的，Contour 以 Deployment 的方式运行，Envoy 以 Daemonset 的方式运行，当然其他方式部署也是可以的。Contour 是调用 Kubernetes API 的客户端。Contour 监视 Ingress，HTTPProxy, Secret, Service 和 Endpoint 对象，并转换为 Envoy 的相关配置：例如，Service 对应 CDS，Ingress 对应 RDS，Endpoint 对应 EDS 等等。

下图显示了启用主机网络（`hostNetwork: true`）的 EnvoyProxy (0.0.0.0:80)。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220515012411.png)
### 3.2 Nginx
Nginx Ingress Controller 的目标是组装一个配置文件（nginx.conf）。当配置文件发生任何更改时需要重新加载 Nginx。需要注意的是，如果只有 upstream（应用程序的 Endpoint）变化的话，此时无需重新加载 Nginx。我们可以使用 [lua-nginx-module [3]](https://github.com/openresty/lua-nginx-module) 来实现这一点。

每当 Endpoint 更改时，控制器都会从 Service 中获取 Endpoint 并生成相应的后端对象。然后将这些对象发送到在 Nginx 中运行的 Lua 处理程序。Lua 代码将这些后端对象存储在共享内存区域中。对于在 [balancer_by_lua [4]](https://github.com/openresty/lua-resty-core/blob/master/lib/ngx/balancer.md) 上下文中的请求，Lua 代码会检测到有哪些上游 Enpdoint ，并应用配置的负载均衡算法来选择 Endpoint。其余的工作由 Nginx 负责。这样我们可以避免在 Endpoint 更改时重新加载 Nginx。在频繁部署应用程序的相对较大的集群中，此功能可以节省 Nginx 大量的重新加载，从而避免影响响应延迟、负载均衡质量（每次重新加载后 Nginx 都会重置负载均衡状态）等问题。

### 3.3 Nginx + Keepalived — 高可用部署
[keepalived [5]](https://keepalived.readthedocs.io/en/latest/) 守护进程可用于监控服务或系统，并在出现问题时自动完成故障转移。我们配置一个可以在工作节点之间漂移的[浮动 IP [6]](https://www.digitalocean.com/community/tutorials/how-to-use-floating-ips-on-digitalocean)。当工作节点宕机时，浮动 IP 会自动漂移到另一个工作节点上，新的工作节点接收访问流量。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220515020019.png)
### 3.4 MetalLB — 带有 LoadBalancer 服务的 Nginx（适用于含有少量公网地址的私有集群）

MetalLB 是裸机 Kubernetes 集群中负载均衡器的实现。简单来说，它允许你在非云提供商提供的 Kubernetes 集群中创建类型为 **LoadBalancer** 的 Kubernetes Service。在云提供商提供的 Kubernetes 集群中，由云提供商负责分配 LoadBalancer  Service 的 IP 地址，并在云提供商的负载均衡设备上发布服务（例如 AWS 的 ELB，阿里云的 SLB 等）。在裸机 Kubernetes 集群中，MetalLB 负责分配 IP 地址。一旦 MetalLB 为服务分配了外部 IP 地址，它需要让集群外部的网络知道这个 IP “存在“于集群中。MetalLB 使用标准的路由协议实现这一点：ARP，NDP 或者 BGP。


在 Layer 2 模式下，集群中的一台机器获得 IP 地址的所有权并使用标准地址发现协议（IPv4 使用 [ARP [7]](https://en.wikipedia.org/wiki/Address_Resolution_Protocol)，IPv6 使用 [NDP [8]](https://en.wikipedia.org/wiki/Neighbor_Discovery_Protocol)）。**在 Layer 2 模式下，所有 LoadBalancer 类型的 Service 的 IP 同一时间都是绑定在同一台节点的网卡上，存在单点网络瓶颈。**

在 BGP 模式下，集群中的所有机器都与外部路由器建立 [BGP [9]](https://en.wikipedia.org/wiki/Border_Gateway_Protocol) 邻居关系，并告诉路由器如何将流量转发到 Service IP。基于 BGP 的策略机制，使用 BGP 可以实现跨多个节点真正的负载均衡，以及细粒度的流量控制。

MetalLB 运行时有两种工作负载：
-   Controler：以 Deployment 方式部署，是集群范围的 MetalLB 控制器，用于监听 Service 的变更，分配/回收 IP 地址。
-   Speaker：以 DaemonSet 方式部署，对外广播 Service 的 IP 地址。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220515020157.png)

## 4 参考资料
- [1] 原文链接: https://dramasamy.medium.com/life-of-a-packet-in-kubernetes-part-4-4dbc5256050a
- [2] Ingress Controller: https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/#additional-controllers
- [3] lua-nginx-module: https://github.com/openresty/lua-nginx-module
- [4] balancer_by_lua: https://github.com/openresty/lua-resty-core/blob/master/lib/ngx/balancer.md
- [5] keepalived: https://keepalived.readthedocs.io/en/latest/
- [6] floating IP address: https://www.digitalocean.com/community/tutorials/how-to-use-floating-ips-on-digitalocean
- [7] ARP: https://en.wikipedia.org/wiki/Address_Resolution_Protocol
-  [8] NDP: https://en.wikipedia.org/wiki/Neighbor_Discovery_Protocol
- [9] BGP: https://en.wikipedia.org/wiki/Border_Gateway_Protocol

## 5 欢迎关注
![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220104221116.png)
