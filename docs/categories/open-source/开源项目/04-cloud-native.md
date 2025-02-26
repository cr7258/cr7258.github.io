---
title: 云原生
author: Se7en
categories:
 - Cloud Native
tags:
 - Cloud Native
 - Open Source
---

# 云原生

## Kubernetes 集群管理

### Gardener

[Gardener](https://github.com/gardener/gardener) 是一个由 SAP 开源的 Kubernetes as a Service (KaaS) 平台，专注于跨多个云提供商和本地环境提供统一的 Kubernetes 集群管理，支持 AWS、Azure、GCP、OpenStack 等主流云平台。Gardener 采用 Kubernetes-on-Kubernetes 的架构，使用 "Seed" 集群管理多个 "Shoot" 集群（用户的 Kubernetes 集群），实现 Kubernetes 的全生命周期管理，包括创建、销毁、节点扩缩容等。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502261030690.png)

### k0rdent

[k0rdent](https://github.com/k0rdent/k0rdent) 是一个开源平台，致力于为 Kubernetes 集群的大规模部署和管理提供标准化且高效的方法，同时充当 Kubernetes 的“超级控制平面”，无缝编排和管理多个 Kubernetes 集群。它依赖 [Cluster API (CAPI)](https://cluster-api.sigs.k8s.io/) 来管理 Kubernetes 集群的生命周期，并使用 [Sveltos](https://github.com/projectsveltos) 作为 Kubernetes Add-on 控制器，以简化 Kubernetes 应用程序的部署与管理。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502261046691.png)