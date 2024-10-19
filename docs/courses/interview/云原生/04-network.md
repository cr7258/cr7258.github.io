---
title: 网络
author: Se7en
categories:
  - Interview
tags:
  - Network
---

## CNI 插件可以分为哪几类？

CNI 插件可分为 3 类：
- **Main 插件**：用来创建具体网络设备的二进制文件。比如，bridge、ipvlan、loopback、macvlan、ptp(point-to-point, Veth Pair 设备)，以及 vlan。如开源的 Flannel、Weave 等项目，都属于 bridge 类型的 CNI 插件，在具体的实现中，它们往往会调用 bridge 这个二进制文件。
- **Meta 插件**：由 CNI 社区维护的内置 CNI 插件，不能作为独立的插件使用，需要调用其他插件。tuning，是一个通过 sysctl 调整网络设备参数的二进制文件；portmap，是一个通过 iptables 配置端口映射的二进制文件；bandwidth，是一个使用 Token Bucket Filter (TBF) 来进行限流的二进制文件。
- **IPAM 插件**：IP Address Management，它是负责分配 IP 地址的二进制文件。比如，dhcp，这个文件会向 DHCP 服务器发起请求；host-local，则会使用预先配置的 IP 地址段来进行分配。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410191805139.png)

参考资料：

- [articles/K8s 系列(六) - 浅谈 CNI.md](https://github.com/k8s-club/k8s-club/blob/main/articles/K8s%20%E7%B3%BB%E5%88%97(%E5%85%AD)%20-%20%E6%B5%85%E8%B0%88%20CNI.md)

