---
title: Kubernetes
author: Se7en
categories:
  - Interview
tags:
  - Kubernetes
---

## Kubelet

### 1 Kubelet 的作用是什么？
Kubelet 是 Kubernetes 中最重要的节点代理程序，运行在集群中的每个节点上。它能够自动将节点注册到 Kubernetes 集群，将节点、Pod 的运行状态和资源使用情况周期性地上报至 API Server，同时接收 API Server 下发的工作任务、启动或停止容器、维护和管理 Pod。

### 2 Kubelet 获取 Pod Spec 的来源有哪些？
Kubelet 获取 Pod Spec 的来源有 3 种，即 API Server、File 和 HTTP：
- API Server 是 Kubelet 获取 Pod Spec 的主要来源，Kubelet 通过 Informer List-Watch 机制持续获取来自 API Server 的 Pod 变化事件，触发执行 sync 调谐。
- File 和 HTTP 主要用于发现 Static Pod，Kubelet 默认每隔 20 秒执行一次检测，重新从 File 或 HTTP 地址加载 Pod Spec。为了加速配置变更检测的速度，对于 Linux 下 file 类型的 Static Pod，Kubelet 支持通过 fsnotify 方式 Watch 指定文件夹下的变更事件。
- File 通过 `staticPodPath` 配置指定 Static Pod 配置文件的路径（以前是 `--pod-manifest-path` 参数），默认监听的文件夹地址是 `/etc/kubernetes/manifests`；HTTP 通过 `staticPodURL` 配置指定 Static Pod 配置文件的 URL（以前是 `--manifest-url` 参数）。

参考资料：深入理解 Kubernetes 源码 P596

### 3 PLEG 是什么？
PLEG（Pod Lifecycle Event Generator）是 kubelet 的一个重要核心组件，负责监控 kubelet 管理的节点上运行的 Pod 的生命周期，并生成与生命周期有关的事件。

### 4 PLEG 产生的原因是什么？
在 Kubernetes 中，kubelet 负责维护和管理每个节点上的 Pod，不断调谐 Pod 的状态（Pod Status）以使其符合定义的要求（Pod Spec）。在引入 PLEG 之前，为了监听 Pod Status 的变化，每个 Pod 的处理协程（Pod Worker）都会独立地周期性地为所有容器拉取最新状态来获取变化。这种轮询会产生不可忽略的开销，而且会随着 Pod 数量的增加而不断增大，从而导致过高的 CPU 占用，降低节点的处理性能，甚至由于对容器运行时产生过大的压力而出现稳定性问题。

参考资料：深入理解 Kubernetes 源码 P652

### 5 PLEG 的核心功能和架构

PLEG 主要包含两个核心功能：一是感知容器变化，生成 Pod 事件，而是维持一份最新的 Pod Status Cache 数据以供其他组件读取，其架构设计如下图所示。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202409242245211.png)

kubelet 同时接收两个方向的事件，Pod Spec 有 API Server、File、HTTP 三大来源，而 Pod Status 则来自 PLEG。
无论是收到 Pod Spec 变化，还是收到 Pod Status 变化，都会触发对应 Pod Worker 执行 Reconcile 调谐逻辑，使 Pod Status 符合最新的 Spec 定义。
Pod Worker 在执行调谐的过程中，会读取由 PLEG 维护的最新的 Pod Status，以避免直接向容器运行时发起请求，降低容器运行时的压力，同时提高状态读取效率。

在 v1.25 版本的 kubelet 中，PLEG 仅实现了基于周期性（当前的硬编码默认值是 1s）relist 方式的容器事件生成，从 v1.26 版本开始，kubelet 引入了 Evented PLEG，并且在 v1.27 版本进入 beta 阶段，实现了对接上游容器状态事件生成器的功能，以支持对上游容器运行时的事件监听，减少 relist 的开销，并且提高事件响应速度。由于 Evented PLEG 依赖 CRI Runtime 的支持，默认处于关闭状态，因此需要显式开启 EventedPLEG feature gate 才能使用该功能。

参考资料：
- 深入理解 Kubernetes 源码 P653
- [KEP-3386: Kubelet Evented PLEG for Better Performance](https://github.com/kubernetes/enhancements/blob/master/keps/sig-node/3386-kubelet-evented-pleg/README.md)

### 6 Kubelet 的主程序核心处理流程