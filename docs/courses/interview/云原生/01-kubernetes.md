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

### 2 Kubelet 获取 PodSpec 的来源有哪些？
Kubelet 获取 PodSpec 的来源有 3 种，即 API Server、file 和 HTTP：
- API Server 是 Kubelet 获取 PodSpec 的主要来源，Kubelet 通过 Informer List-Watch 机制持续获取来自 API Server 的 Pod 变化事件，触发执行 sync 调谐。
- file 和 HTTP 主要用于发现 Static Pod，Kubelet 默认每隔 20 秒执行一次检测，重新从文件或 HTTP 地址加载 PodSpec。为了加速配置变更检测的速度，对于 Linux 下 file 类型的 Static Pod，Kubelet 支持通过 fsnotify 方式 Watch 指定文件夹下的变更事件。
- file 通过 `staticPodPath` 配置指定 Static Pod 配置文件的路径（以前是 `--pod-manifest-path` 参数），默认监听的文件夹地址是 `/etc/kubernetes/manifests`；HTTP 通过 `staticPodURL` 配置指定 Static Pod 配置文件的 URL（以前是 `--manifest-url` 参数）。

### 3 Pod Lifecycle Event Generator (PLEG) 在 Kubelet 中的作用和工作原理
