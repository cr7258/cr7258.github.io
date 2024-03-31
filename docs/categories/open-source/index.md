---
showArticleMetadata: false
editLink: false
lastUpdated: false
showComment: false
---

# 开源项目

::: tip 笔者说
开源是一种理念，它鼓励知识共享、协作和自由使用，将代码公开让全世界的开发者能够共同参与和改进。这不仅促进了技术的创新和快速迭代，也建立了一个全球性的开发者社区和合作平台。  
:::

## AI

### Kubeflow

- [kubeflow/kubeflow](https://github.com/kubeflow/kubeflow)

## WebAssembly

### WasmEdge

### WasmCloud

wasmCloud 允许使用 WebAssembly 组件和功能提供程序进行简单、安全、分布式的应用程序开发。

- [wasmCloud/wasmCloud](https://github.com/wasmCloud/wasmCloud)

### Kwasm

### Wasker

Wasker 是一个 WebAssembly 编译器。Wasker 将 Wasm 二进制文件编译为 ELF 格式的二进制文件。 目前，Wasker 支持 WASI 预览版 1。

- [Mewz-project/Wasker](https://github.com/Mewz-project/Wasker)

### Mewz

专为运行 Wasm 应用而设计的 unikernel，兼容 WASI。

- [Mewz-project/Mewz](https://github.com/Mewz-project/Mewz)

## eBPF

### bpfman

适用于 Linux 和 Kubernetes 的 eBPF 管理器。

- [bpfman/bpfman](https://github.com/bpfman/bpfman)
- [Fedora 未来默认 BPF 管理器 bpfman 简介](https://mp.weixin.qq.com/s/ER3RWcS1Jvg7MT9pRjfEoA)

### bpftop

- [Netflix/bpftop](https://github.com/Netflix/bpftop)
- [一款 Rust 写的 ebpf 监控工具 bpftop](https://mp.weixin.qq.com/s/NL3kSXfF9k93reZ4bjSeKQ)

### bpftune

bpftune 使用 BPF 自动调优 Linux 系统。

- [oracle/bpftune](https://github.com/oracle/bpftune)

### Beyla

基于 eBPF 的 HTTP 和 HTTPS 服务自动化检测。

- [grafana/beyla](https://github.com/grafana/beyla)

### bpfilter

用 BPF 完全替代 iptables 防火墙的概念证明程序。

- [facebook/bpfilter](https://github.com/facebook/bpfilter)

### kubectl-trace

使用 kubectl 在 kubernetes 集群上调度 bpftrace 程序。

- [kubectl-trace](https://github.com/iovisor/kubectl-trace)

### ebpf_exporter

Prometheus 导出器，用于自定义 eBPF 指标和 OpenTelemetry 跟踪。

- [cloudflare/ebpf_exporter](https://github.com/cloudflare/ebpf_exporter)

### Tracee

- [aquasecurity/tracee](https://github.com/aquasecurity/tracee)

### KubeArmor

## 策略引擎

### Kyverno

## 调度

### Kwok

### Kubernetes scheduler simulator

### Scheduler Plugins

### Kueue

- [Kueue v0.6.0 引入多集群队列能力](https://mp.weixin.qq.com/s/A34wC8eEdqov2GiGjdte5g)

### Descheduler

### SimKube

- [SimKube 官方文档](https://appliedcomputing.io/simkube/)
- [SimKube Demo](https://www.youtube.com/watch?v=Q1XpH1H4It8)
- [SimKube 模拟 Kubernetes 集群](https://yylives.cc/2024/01/03/simulate-kubernetes-cluster-behavior-with-simkube/)

## 边缘计算

### KubeEdge

## 网络

### Cilium

### Calico

### Antrea

### Flannel

### Multus

### Whereabouts

### Spiderpool

### Kubeshark

Kubeshark 是一个用于 Kubernetes 的 API 流量分析器,提供实时、协议级别的 Kubernetes 内部网络可见性，捕获和监控所有进出和跨容器、Pod、节点和集群的流量和负载。

- [kubeshark/kubeshark](https://github.com/kubeshark/kubeshark)

### DPDK

#### F-Stack

- [F-Stack 官方文档](https://f-stack.org/)

## 服务网格

### Istio

### Linkerd

### Kuma

## 网关

### Higress

### Envoy

### APISIX

### Kong

### Nginx

### OpenResty

## 存储

### Ceph

### OpenEBS

## 多集群

### Karmada

### Submariner

### Clusternet

### Skupper

### Kosmos

https://kosmos-io.github.io/website/v0.2.0/getting-started/introduction

### Liqo

Liqo 是一个开源项目，可实现动态无缝的 Kubernetes 多集群拓扑结构，支持异构本地、云和边缘基础设施。

- [liqotech/liqo](https://github.com/liqotech/liqo)

### KubeSlice

KubeSlice 使得 Kubernetes 的 Pod 和服务能够通过创建逻辑应用边界（称为 Slices）在集群、云端、边缘和数据中心之间无缝通信。

- [KubeSlice 官方文档](https://kubeslice.io/)
- [使用 KubeSlice 简化混合/多集群、多云 Kubernetes 部署](https://mp.weixin.qq.com/s/GW_3l2l5TamSWU7Ato-r6w)

## 平台工程

### Backstage

### Radius

### KusionStack

## IaC

### Pulumi

### KCL

### Crossplane

### Terraform

### Burrito

- [padok-team/burrito](https://github.com/padok-team/burrito)

## 可观测性

### OpenTelemetry

#### OpenLLMetry

- [traceloop/openllmetry](https://github.com/traceloop/openllmetry)

#### eBPF Collector

- [open-telemetry/opentelemetry-network](https://github.com/open-telemetry/opentelemetry-network)

#### Otelbin

基于 Web 的工具，便于 OpenTelemetry 收集器配置编辑和验证。

- [dash0hq/otelbin](https://github.com/dash0hq/otelbin)

### Signoz

### Odigos

### Prometheus

### Grafana

### Jaeger

### Zipkin

### SkyWalking

## DevOps

### kubechecks

kubechecks 允许 Github 和 Gitlab 的用户准确查看他们的更改将对他们当前的 ArgoCD 部署产生什么影响，并在合并之前自动运行各种一致性测试套件。

- [zapier/kubechecks](https://github.com/zapier/kubechecks)

### Skaffold

Skaffold 是一款帮助 Kubernetes 应用程序持续开发的命令行工具。你可以在本地迭代应用程序源代码，然后部署到本地或远程 Kubernetes 集群。Skaffold 负责构建、推送和部署应用程序的整个流程。它还提供了 CI/CD 管道的基础组件和自定义配置。

简单来说就是一个本地的CICD工具，可以将你的应用快速部署到 Kubernetes 集群。监听源代码的变化，并自动构建更新镜像。

- [GoogleContainerTools/skaffold](https://github.com/GoogleContainerTools/skaffold)

## 集成测试

### Testcontainers

## 远程开发

### DevPod

### Development Containers

### Telepresence

https://www.getambassador.io/docs/telepresence-oss/latest/quick-start

## 混沌测试

### Chaos Mesh

### Chaosblade

### ChaosMeta

ChaosMeta 是蚂蚁集团开源的一款云原生混沌工程平台。它凝聚了蚂蚁集团在公司级大规模红蓝攻防演练实践中多年积累的方法论、技术以及产品。由“风险目录”（内部对各领域技术组件的通用风险场景手册）作为理论指导，结合技术实践，为蚂蚁集团多年的各种大促活动保驾护航。

- [ChaosMeta 官方文档](https://chaosmeta.gitbook.io/chaosmeta-cn)

## 备份

### Velero

## 多租户

### Capsule

https://capsule.clastix.io/

### vCluster

https://github.com/loft-sh/vcluster

### Kamaji

Kamaji 是 Kubernetes 的托管控制平面管理器。

- [clastix/kamaji](https://github.com/clastix/kamaji)

### k0smotron

- [k0sproject/k0smotron](https://github.com/k0sproject/k0smotron)

## 工具

### Bruno

Postman 和 Isomnia 的替代品，可以通过配置文件来管理 API。

- [usebruno/bruno](https://github.com/usebruno/bruno)

## 安全

### Tetragon

- [cilium/tetragon](https://github.com/cilium/tetragon)
- [Isovalent Enterprise for Tetragon: Deeper Host Network Observability with eBPF](https://isovalent.com/blog/post/tetragon-network-observability-dashboards/)

### Falco

Falco 是适用于 Linux 操作系统的云原生运行时安全工具。它旨在实时检测异常行为和潜在的安全威胁并发出警报。

- [falcosecurity/falco](https://github.com/falcosecurity/falco)

#### Falcosidekick

- [falcosecurity/falcosidekick](https://github.com/falcosecurity/falcosidekick)
- [Cloud Native Live: Falcosidekick](https://www.youtube.com/watch?v=1ewRLb4cack)

#### Falcon Talon

Falco Talon 是一个用于管理 Kubernetes 中威胁的响应引擎。它通过无代码的定制解决方案增强了 Falco 社区提出的解决方案。借助简单的规则，你可以在毫秒级别对来自 Falco 的事件做出反应。

- [Falco-Talon/falco-talon](https://github.com/Falco-Talon/falco-talon)

### GPU

#### HAMi

- [Project-HAMi/HAMi](https://github.com/Project-HAMi/HAMi)

### 数据库

#### Atlas

Atlas Kubernetes Operator 是一个 Kubernetes 控制器，它使用 Atlas 来管理数据库的架构。Atlas Kubernetes Operator 允许你定义所需的架构，并使用 Kubernetes API 将其应用到数据库。

- [ariga/atlas](https://github.com/ariga/atlas)

#### KubeBlock

KubeBlocks 是一个开源控制平面，用于在 K8s 上运行和管理数据库、消息队列和其他数据基础设施。

- [apecloud/kubeblocks](https://github.com/apecloud/kubeblocks)

### 包管理

#### Helm

#### Kustomize

#### Helmfile

#### Helmify

通过 Kubernetes yaml 创建 Helm Chart。

- [arttor/helmify](https://github.com/arttor/helmify)

## 策略引擎

### kubewarden

- [kubewarden 官方文档](https://www.kubewarden.io/)

## Kubernetes Operator

### Operator SDK

### Kubebuilder

## 其他

### canary-checker

Canary checker 是一个基于 Kubernetes 的平台，用于通过被动和主动的方式监控应用程序和基础设施的健康状况。

- [flanksource/canary-checker](https://github.com/flanksource/canary-checker)
