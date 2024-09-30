---
title: Kubernetes
author: Se7en
categories:
  - Interview
tags:
  - Kubernetes
---

## Kube-Scheduler

### Scheduling Queue （调度队列）的工作原理是怎么样的？


参考资料：
- [Kubernetes 调度器队列 - 设计与实现](https://dbwu.tech/posts/k8s/source_code/scheduler_queue/)
- [k8s-src-analysis/kube-scheduler/SchedulingQueue.md](https://github.com/jindezgm/k8s-src-analysis/blob/master/kube-scheduler/SchedulingQueue.md)
- 深入理解 Kubernetes 源码 P432 ～ P433

### Scheduling Framework （调度框架）提供的扩展点有哪些？

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202409301535075.png)

Scheduling Framework 通过 Plugin API 定义了多个扩展点，调度插件能够通过实现对应扩展点的 API 接口，注册到调度器框架中，在合适的时机被调用。
Scheduler Framework 提供了丰富的扩展点，如上图所示，包括：

- **PreEnqueue** 插件在 v1.27 版本引入，在 Pod 进入 `activeQ` 队列之前被调用，仅将符合条件的 Pod 放入活动队列（Pod 的 `spec.schedulingGates` 字段为空），否则直接放入 `unschedulablePods` 对象中。
- **QueueSort** 插件用于处理 Pod 在调度队列中的排序顺序。`QueueSort` 插件需要实现 `Less` 函数，该函数用于比较两个 Pod 的大小，以便调度器能够对等待调度的 Pod 进行排序。默认调度器使用的是 `PrioritySort` 插件，顾名思义是按照 Pod 的优先级进行排序，优先级高的 Pod 会被优先调度。如果优先级相同，则时间戳较早的 Pod 会被优先调度。注意，在一个调度器中，只能启用一个 `QueueSort` 插件。 
- **PreFilter** 插件主要用于实现 `Filter` 之前的预处理，如根据待调度的 Pod 计算 `Filter` 阶段需要使用的调度相关信息，或者检查 Pod 依赖的集群状态必须满足的调度要求，在需求不满足时提前退出，避免无效调度。如果 `PreFilter` 插件返回错误，则调度过程会立即终止，后续的调度过程将不再执行。由于 `PreFilter` 插件在每个 Pod 调度过程中只执行一次，而 `Filter` 会对每个节点执行一次，因此一般将仅与 Pod 相关的计算逻辑前置到 `PreFilter` 阶段进行（比如 [Fit 插件](https://github.com/kubernetes/kubernetes/blob/1bbe775d5ffb131636193fe0bc15a8fcc0cd6fd6/pkg/scheduler/framework/plugins/noderesources/fit.go#L218-L230)在 `PreFilter` 阶段计算 Pod 的资源请求），通过 Scheduling Context（CycleState）将预计算结果传递给 `Filter` 函数，避免 `Filter` 阶段产生大量重复计算。
- **Filter** 插件执行预选主逻辑，即选出能够运行待调度 Pod 的目标节点。对于每个节点，调度器会按照配置顺序依次执行 `Filter` 插件，如果有任意一个 `Filter` 插件将当前节点标记为不可调度，则该节点被认定为不符合调度要求，后续的调度过程将不再执行。由于对节点是否符合调度要求而言，不同节点之间是相互不影响的，因此针对不同节点的预选是并行执行的，默认调度器会启动 16 个协程分片处理。
- **PostFilter** 插件仅在 `Filter` 插件没有筛选出合适的节点的条件下才会被调用。一个典型的 `PostFilter` 插件实现就是 Pod 驱逐抢占，它通过驱逐节点上优先级更低的 Pod，使节点能够运行当前待调度的高优先级 Pod。`PostFilter` 在实现上会根据 `Filter` 阶段产生的节点过滤结果，默认的内置驱逐插件会根据 `Filter` 的失败原因，即 `Unschedulable` 或 `UnschedulableAndUnresolvable` 快速确定能否通过驱逐 Pod 使目标节点变得可调度。`PostFilter` 插件按照配置顺序依次执行，当某个插件将一个节点标记为可调度时，`PostFilter` 插件调度过程结束，后续的 `PostFilter` 插件将不会被调用。
- **PreScore** 插件与 `PreFilter` 类似，主要用于执行 `Score` 的前置准备任务，如预处理 Pod 在打分阶段需要用到的相关信息。如果 `PreScore` 插件返回错误，则调度过程会立即终止，后续的调度过程将不再执行。由于 `PreScore` 插件在每个 Pod 被调度时只执行一次，而 `Score` 需要分别针对每个候选节点执行一次，因此一般将仅与 Pod 相关的计算逻辑前置到 `PreScore` 阶段进行，通过 Scheduling Context（CycleState）将预计算结果传递给 `Score` 函数，避免 `Score` 阶段产生大量重复计算。
- **NormalizeScore** 插件用于在对节点进行最后的打分排名前，对得分进行归一化处理。归一化的用意在于，将不同插件的打分统一到 [0,100] 的区间范围，使各个 `Score` 插件对最终的得分的影响程度尽可能相同。由于 `NormalizeScore` 主要用于对 `Score` 的打分结果进行修改，因此在实现上会作为 `Score` 插件的 `ScoreExtensions` 扩展存在。
- **Reserve** 插件主要用于为即将调用的 Pod 在目标节点上预留资源（例如 [VolumeBinding 插件](https://github.com/kubernetes/kubernetes/blob/1bbe775d5ffb131636193fe0bc15a8fcc0cd6fd6/pkg/scheduler/framework/plugins/volumebinding/volume_binding.go#L477)假定 PVC 和 PV 绑定并更新 PV 缓存），主要是为了防止 kube-scheduler 在等待绑定的成功前出现争用的情况（因为绑定是异步执行的，调度下一个 Pod 可能发生在绑定完成之前）。实现 `Reserve` 扩展点的插件需要实现两个接口：`Reserve` 和 `UnReserve`。如果 `Reserve` 插件调用成功，则 `UnReserve` 默认不会被调用。如果调用成功后需要对运行时状态进行更新，可以选择在 `PostBind` 阶段执行对应的更新逻辑。`UnReserve` 的调用时机除了 `Reserve` 执行失败，在之后的任意一个阶段调用失败，都会触发执行。
- **Permit** 插件在调度决策完成但还没有发起绑定流程时被调用，用于阻止或延迟绑定流程的执行。`Permit` 插件可以在多 Pod 协同调度场景中，确保相关的一组 Pod 能够同时被调度，这在一些大数据和机器学习的使用场景中比较常见。
- **PreBind** 插件用于执行绑定前的准备工作，例如，提供网络存储卷并挂载到目标节点，以便 Pod 能够在被调度到节点上后正常启动。
- **Bind** 插件通过向 api-server 发起 Bind 请求，真正执行 Pod 和节点的绑定操作。
- **PostBind** 插件在 Pod 绑定完成后被调用，主要用于执行通知或清理操作。

参考资料
- [k8s-src-analysis/kube-scheduler/Plugin.md](https://github.com/jindezgm/k8s-src-analysis/blob/master/kube-scheduler/Plugin.md)
- 深入理解 Kubernetes 源码 P446 ～ P452

## Kubelet

### 1 Kubelet 的作用是什么？
Kubelet 是 Kubernetes 中最重要的节点代理程序，运行在集群中的每个节点上。它能够自动将节点注册到 Kubernetes 集群，将节点、Pod 的运行状态和资源使用情况周期性地上报至 kube-apiserver，同时接收 kube-apiserver 下发的工作任务、启动或停止容器、维护和管理 Pod。

### 2 Kubelet 获取 Pod Spec 的来源有哪些？
Kubelet 获取 Pod Spec 的来源有 3 种，即 kube-apiserver、File 和 HTTP：
- kube-apiserver 是 Kubelet 获取 Pod Spec 的主要来源，Kubelet 通过 Informer List-Watch 机制持续获取来自 kube-apiserver 的 Pod 变化事件，触发执行 sync 调谐。
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

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202409292104080.png)


kubelet 同时接收两个方向的事件，Pod Spec 有 kube-apiserver、File、HTTP 三大来源，而 Pod Status 则来自 PLEG。
无论是收到 Pod Spec 变化，还是收到 Pod Status 变化，都会触发对应 Pod Worker 执行 Reconcile 调谐逻辑，使 Pod Status 符合最新的 Spec 定义。
Pod Worker 在执行调谐的过程中，会读取由 PLEG 维护的最新的 Pod Status，以避免直接向容器运行时发起请求，降低容器运行时的压力，同时提高状态读取效率。

在 v1.25 版本的 kubelet 中，PLEG 仅实现了基于周期性（当前的硬编码默认值是 1s）relist 方式的容器事件生成，从 v1.26 版本开始，kubelet 引入了 Evented PLEG，并且在 v1.27 版本进入 beta 阶段，实现了对接上游容器状态事件生成器的功能，以支持对上游容器运行时的事件监听，减少 relist 的开销，并且提高事件响应速度。由于 Evented PLEG 依赖 CRI Runtime 的支持，默认处于关闭状态，因此需要显式开启 EventedPLEG feature gate 才能使用该功能。

参考资料：
- 深入理解 Kubernetes 源码 P653
- [KEP-3386: Kubelet Evented PLEG for Better Performance](https://github.com/kubernetes/enhancements/blob/master/keps/sig-node/3386-kubelet-evented-pleg/README.md)

### 6 Kubelet 的主程序核心处理流程

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202409292105418.png)

kubelet 的主调谐程序 `syncLoop` 同时监听来自不同组件的事件，包括：

- 1. 来自 kube-apiserver、File、HTTP 的 Pod Spec 变化事件
- 2. 来自 PLEG 的 Pod Status 变化事件
- 3. 来自 ProbeManager（包括 liveness、readiness、startup 3 种健康探针）的状态变更事件
- 4. 内置定时器（TimeTicker）事件

为了保证所有事件都能及时得到处理，kubelet 的主调谐程序采用了非阻塞的基于事件的处理模式。在事件源方面，所有的事件监听程序采用独立协程运行，将产生的事件通过相应 Channel 传递给 `syncLoopIteration` 函数进行处理。

`syncLoopIteration` 可以看作是一个事件分发器，它同时监听来自多个 Channel 的事件，根据事件类型的不同，分别执行不同的 SyncHandler 函数。

为了实现主调谐程序的非阻塞运行，kubelet 对事件的处理同样采用了异步执行的方式。对于每个 Pod，kubelet 会通过 Pod Worker 单独为其创建一个 goroutine，由每个 goroutine 独立处理对应 Pod 的变更事件。

参考资料：深入理解 Kubernetes 源码 P598