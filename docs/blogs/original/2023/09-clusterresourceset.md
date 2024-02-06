---
title: 使用 ClusterResourceSet 为 Cluster API 集群自动安装 CNI 插件
author: Se7en
date: 2023/05/08 22:00
categories:
 - 原创
tags:
 - Cluster API
---

# 使用 ClusterResourceSet 为 Cluster API 集群自动安装 CNI 插件

## 1 什么是 Cluster API

[Cluster API[1]](https://cluster-api.sigs.k8s.io/introduction.html) 是一个 Kubernetes 子项目，它将声明式、Kubernetes 风格的 API 引入到集群的创建、配置和管理中。Cluster API 支持在 AWS, Azure, GCP, vSphere, KubeVirt 等多种环境中创建和管理 Kuberenetes 集群，并负责提供部署集群所需的基础设施（例如 VPC, 虚拟机, 负载均衡等等）。此外 Cluster API 也支持在本地以 Kind（Kubernetes in Docker） 的方式快速创建用于测试的集群。


![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20221229102318.png)

在 Cluster API 中主要有两种集群：
- 管理集群（Management cluster）： 在集群中部署 Cluster API 相关的管理组件。
- 工作负载集群（Workload cluster）：通过 Cluster API 创建出来的集群。


## 2 ClusterResourceSet 有什么用

Cluster API 创建的集群仅包含最基本的功能。例如，它们没有 Pod 到 Pod 网络所需的容器网络接口 (CNI)，也没有动态持久卷配置所需的 StorageClass。当前用户必须手动将这些组件安装到他们创建的每一个集群中。

因此，Cluster API 引入了 ClusterResourceSet CRD，ClusterResourceSet Controller 会自动将用户在 ClusterResourceSet 中定义的一组资源配置应用到相应的集群中（通过 `label selectors` 根据标签选择集群），使得 Cluster API 创建的集群从一开始就为工作负载做好准备，而无需额外的用户干预。

在本文中，我们将会通过 ClusterResourceSet 来自动为工作负载集群安装 Cilium CNI 插件，所有使用到的资源文件可以在下面的 Github 链接中获取。

```bash
https://github.com/cr7258/hands-on-lab/tree/main/cluster-api/clusterresourceset
```

## 3 前提准备

- [kind[2]](https://kind.sigs.k8s.io/docs/user/quick-start/#installation) 可以用来在本地运行和测试 Kubernetes 集群，它使用 Docker 容器来作为 Kubernetes 的节点。
- [kubectl[3]](https://kubernetes.io/docs/tasks/tools/)是用于管理 Kubernetes 的命令行工具。
- [clusterctl[4]](https://cluster-api.sigs.k8s.io/clusterctl/overview.html#overview-of-clusterctl)是用于管理 Cluster API 集群的生命周期的命令行工具。

## 4 创建管理集群

首先，我们通过 Kind 创建一个管理集群。Kind 的配置文件如下，在本文中我们将使用 Cluster API 的 Docker Provider 来创建工作负载集群，因此我们要让 Kind 集群能够访问到主机上的 Docker 进程。

```yaml
apiVersion: kind.x-k8s.io/v1alpha4
kind: Cluster
name: manage-cluster
nodes:
- role: control-plane
  extraMounts:
    - hostPath: /var/run/docker.sock
      containerPath: /var/run/docker.sock
```

使用上述文件创建管理集群。

```bash
kind create cluster --config kind.yaml
```


## 5 安装 Cluster API 组件

使用 `clusterctl init` 命令在管理集群中安装 Cluster API 组件。使用 `--infrastructure` 参数指定使用 Docker 作为基础设施的 Provider。

```bash
export EXP_CLUSTER_RESOURCE_SET=true
export CLUSTER_TOPOLOGY=true
clusterctl init --infrastructure docker
```


## 6 创建安装 Cilium 使用的 Configmap

要使用 ClusterResourceSet 来安装资源，我们需要提供资源所需的 YAML 文件。Cilium 支持使用 Helm 的方式来安装，使用 `helm template` 命令在本地渲染出 YAML 资源文件。你可以根据需要在 `helm template` 命令中通过 `--set <key>=<value>` 指定其他选项或者值，以适应特定的环境或要求。

```bash
helm repo add cilium https://helm.cilium.io
helm repo update
helm template cilium cilium/cilium --version 1.12.5 \
--namespace kube-system > cilium-1.12.5.yaml
```

根据 Cilium 资源文件创建 ClusterResourceSet 需要的 ConfigMap。

```bash
kubectl create configmap cilium-crs-cm --from-file=cilium-1.12.5.yaml
```

## 7 创建 ClusterResourceSet

创建 ClusterResourceSet 引用上一步创建的包含 Cilium 安装资源的 ConfigMap，使用 `clusterSelector` 参数指定根据 `cni=cilium` 的 Label 选择目标集群。

```bash
apiVersion: addons.cluster.x-k8s.io/v1alpha4
kind: ClusterResourceSet
metadata:
  name: cilium-crs
  namespace: default
spec:
  clusterSelector:
    matchLabels:
      cni: cilium 
  resources:
  - kind: ConfigMap
    name: cilium-crs-cm
```

## 8 部署工作负载集群

为了方便用户上手，Cluster API 提供了 `clusterctl generate cluster` 命令用于快速生成创建工作负载集群的 YAML 模板。

```bash
clusterctl generate cluster cluster-1 --flavor development \
  --kubernetes-version v1.25.3 \
  --control-plane-machine-count=3 \
  --worker-machine-count=3 \
  > cluster-1.yaml
```

我们这里先不去深究生成的资源文件，可以直接运行以下命令应用资源文件。

```bash
kubectl apply -f cluster-1.yaml
```

输出类似于：

```bash
clusterclass.cluster.x-k8s.io/quick-start created
dockerclustertemplate.infrastructure.cluster.x-k8s.io/quick-start-cluster created
kubeadmcontrolplanetemplate.controlplane.cluster.x-k8s.io/quick-start-control-plane created
dockermachinetemplate.infrastructure.cluster.x-k8s.io/quick-start-control-plane created
dockermachinetemplate.infrastructure.cluster.x-k8s.io/quick-start-default-worker-machinetemplate created
kubeadmconfigtemplate.bootstrap.cluster.x-k8s.io/quick-start-default-worker-bootstraptemplate created
# 创建了一个集群
cluster.cluster.x-k8s.io/cluster-1 created
```

查看创建的工作负载集群，状态处于 Provisioned 说明已经部署完毕。

```bash
kubectl get cluster
NAME        PHASE         AGE     VERSION
cluster-1   Provisioned   9m19s   v1.25.3
```

获取工作负载集群 cluster-1 的 kubeconfig 文件。

```bash
kind get kubeconfig --name cluster-1 > cluster-1.kubeconfig
```

切换到 cluster-1 集群，可以看到当前集群还未安装 CNI 插件，因此所有 Node 处于 NotReady 状态，并且所有非 `hostNetwork: true` 的 Pod 都处于 Pending 状态。

```bash
export KUBECONFIG=cluster-1.kubeconfig
kubectl get pod -A
kubectl get node
```

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20221228192933.png)

接下来我们切换回管理集群，并给 cluster-1 集群打上 `cni=cilium` 的 Label。

```bash
export KUBECONFIG=~/.kube/config
kubectl label cluster cluster-1 cni=cilium
```

切换到 cluster-1 集群会发现此时已经开始部署 Cilium CNI 了，完成部署后 Node 的状态也会变为 Ready。

```bash
export KUBECONFIG=cluster-1.kubeconfig
kubectl get pod -A
kubectl get node
```

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20221228193617.png)

我们也可以使用以下资源文件创建一个新的集群，并加上 `cni=cilium` 的 Label。ClusterResourceSet Controller 将会在集群完成部署后，自动将 ConfigMap 中的配置应用到新集群中。

```yaml
apiVersion: cluster.x-k8s.io/v1alpha4
kind: Cluster
metadata:
  name: cluster-2
  namespace: default
  labels:
    cni: cilium # 安装 Cilium
spec:
  topology:
    class: quick-start # ClusterClass 的名字
    version: v1.25.3
    workers:
      machineDeployments:
      - class: default-worker # ClusterClass 中定义的 machineDeployments
        name: my-cluster-2
        replicas: 3
```
## 9 参考资料
- [1] Cluster API: https://cluster-api.sigs.k8s.io/introduction.html#kubernetes-cluster-apidiv-stylefloat-right-position-relative-display-inlineimg-srcimagesintroductionsvg-width160px-div
- [2] kind: https://kind.sigs.k8s.io/docs/user/quick-start/#installation
- [3] kubectl: https://kubernetes.io/docs/tasks/tools/
- [4] clusterctl: https://cluster-api.sigs.k8s.io/clusterctl/overview.html#overview-of-clusterctl
- [5] Episode 73: cluster api and flux with cilium: https://hackmd.io/@Echo-Live/073
- [6] Installing Cilium via a ClusterResourceSet: https://blog.scottlowe.org/2021/10/07/installing-cilium-via-clusterresourceset/
- [7] ClusterResourceSet proposal: https://github.com/kubernetes-sigs/cluster-api/blob/main/docs/proposals/20200220-cluster-resource-set.md
- [8] Cluster API Intro and Deep Dive - Yuvaraj Balaji Rao Kakaraparthi & Vince Prignano, VMware: https://www.youtube.com/watch?v=9H8flXm_lKk
- [9] Build Your Own Cluster API Provider the Easy Way - Anusha Hegde, VMware & Richard Case, Weaveworks: https://www.youtube.com/watch?v=HSdgmcAAXa8
- [10] k8s 官方推荐的交付项目cluster-api使用和源码解读: https://zhuanlan.zhihu.com/p/450835027
- [11] Cluster API - KubeAcademy: https://kube.academy/courses/cluster-api
- [12] 一文讲透Cluster API的前世、今生与未来: https://segmentfault.com/a/1190000022650813
- [13] How to Migrate 700 Kubernetes Clusters to Cluster API with Zero Down Time: https://www.youtube.com/watch?v=KzYV-fJ_wH0
