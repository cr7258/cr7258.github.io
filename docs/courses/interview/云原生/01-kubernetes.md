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

调度器的 [SchedulingQueue](https://github.com/kubernetes/kubernetes/blob/release-1.25/pkg/scheduler/internal/queue/scheduling_queue.go#L81-L110) 接口的实现是一个 [PriorityQueue](https://github.com/kubernetes/kubernetes/blob/release-1.25/pkg/scheduler/internal/queue/scheduling_queue.go#L125-L173) 结构体，其中有 3 个子队列：

- ActiveQ（heap）：存放就绪的 Pod，调度流程会从中取出 pod 进行调度。
- BackOffQ（heap）：存放调度失败的 Pod，这里的 Pod 各自被设置了退避时间，等待足够的时间后才可以离开。
- unschedulablePods（map）：存放调度失败且被判定为“无法调度成功”的 Pod，除非集群中发生了特定的事件或者 Pod 已达在子队列中阻塞时间的上限，否则 Pod 不会出队。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410092032285.png)

- [AddUnschedulableIfNotPresent](https://github.com/kubernetes/kubernetes/blob/release-1.25/pkg/scheduler/internal/queue/scheduling_queue.go#L385-L425) 默认会将调度或异步绑定失败的 Pod 添加到 `unschedulablePods` 中，除非在 Pod 调度/绑定的过程中集群状态已经发生了变化。调度器通过 `schedulingCycle` 和 `moveRequestCycle` 两个变量来判断在 Pod 调度/绑定期间集群的状态是否发生了变化。（[p.moveRequestCycle >= podSchedulingCycle](https://github.com/kubernetes/kubernetes/blob/release-1.25/pkg/scheduler/internal/queue/scheduling_queue.go#L412)）
  - `schedulingCycle`，即 `PriorityQueue` 当前的调度轮次，当 `PriorityQueue` pop 一个 Pod 时，该记录会加一。
  - `moveRequestCycle`，即收到最近一次 moveRequest（[movePodsToActiveOrBackoffQueue](https://github.com/kubernetes/kubernetes/blob/release-1.25/pkg/scheduler/internal/queue/scheduling_queue.go#L626-L659) ）时 PriorityQueue 所处的调度轮次，moveRequest 指的是从 UnschedulableQ 中移出特定的 Pod，可以理解为发起 moveRequest 就意味着“集群状态发生了变化”。
  - 结合起来，可以理解一下这里错误处理的细节。在 Pod 调度失败时，正常情况下，会被放进 `unschedulablePods` 队列，但是在某些情况下，Pod 刚刚调度失败，在错误处理之前，忽然发生了资源变更，紧接着再调用错误处理回调，这个时候，由于在这个错误处理的间隙，集群的状态已经发生了变化，所以可以认为这个 Pod 应该有了被调度成功的可能性，所以就被放进了 `backoffQ` 重试队列中，等待快速重试。
- [flushUnschedulablePodsLeftover](https://github.com/kubernetes/kubernetes/blob/release-1.25/pkg/scheduler/internal/queue/scheduling_queue.go#L457-L475) 每隔 [30s](https://github.com/kubernetes/kubernetes/blob/release-1.25/pkg/scheduler/internal/queue/scheduling_queue.go#L291) 运行一次， 将停留在 `unschedulablePods` 中时间超过 [DefaultPodMaxInUnschedulablePodsDuration](https://github.com/kubernetes/kubernetes/blob/release-1.25/pkg/scheduler/internal/queue/scheduling_queue.go#L57) （5 分钟）的 Pod 重新移动到 `backoffQ` 或者 `activeQ` 中。 
- [flushBackoffQCompleted](https://github.com/kubernetes/kubernetes/blob/release-1.25/pkg/scheduler/internal/queue/scheduling_queue.go#L427-L455) 每隔 [1s](https://github.com/kubernetes/kubernetes/blob/release-1.25/pkg/scheduler/internal/queue/scheduling_queue.go#L290) 运行一次，将在 `backoffQ` 中已经完成退避时间的 Pod 重新移动到 `activeQ` 中。在默认情况下，当 Pod 第一次调度失败后，会等待 1s，然后重试，而在后续每次失败后，重试时间将会翻倍，即第二次失败等待 2s，第三次失败等待 4s，以此类推。此外，调度器设置了最长的 backoff 等待时间，在默认情况下，如果 Pod 连续调度失败，则其 backoff 等待时间最长为 10s。

我们可以举一个一般性的例子让 Pod 在 3 个子队列中完整地流转一遍。对于一个带有 NodeAffinity 强限制的 Pod，假设它从 `ActiveQ` 中出队尝试调度且因 NodeAffinity plugin 阻拦而调度失败。此时除非集群中已有节点发生状态（label）变化，否则对该 Pod 再次尝试调度是没有意义的，所以它应当先进入 `unschedulablePods`，直到产生了节点状态变化的事件才适时地将其放进 `BackOffQ`，随后等待达到 backOff 时间并进入 `ActiveQ` 中准备被再次调度。

参考资料：
- [Kube-scheduler 源码分析之调度队列](http://rookie0080.info/archives/1706425339572)
- [Scheduling queue in kube-scheduler](https://github.com/kubernetes/community/blob/f03b6d5692bd979f07dd472e7b6836b2dad0fd9b/contributors/devel/sig-scheduling/scheduler_queues.md)
- [Kubernetes 调度器队列 - 设计与实现](https://dbwu.tech/posts/k8s/source_code/scheduler_queue/)
- [k8s-src-analysis/kube-scheduler/SchedulingQueue.md](https://github.com/jindezgm/k8s-src-analysis/blob/master/kube-scheduler/SchedulingQueue.md)
- [k8s源码分析 2: kube-scheduler](https://jeffdingzone.com/2020/11/k8s%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%902kube-scheduler/)
- 深入理解 Kubernetes 源码 P432 ～ P433

### Scheduling Framework （调度框架）提供的扩展点有哪些？

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202409301535075.png)

Scheduling Framework 通过 Plugin API 定义了多个扩展点，调度插件能够通过实现对应扩展点的 API 接口，注册到调度器框架中，在合适的时机被调用。
Scheduler Framework 提供了丰富的扩展点，如上图所示，包括：

- **PreEnqueue** 插件在 v1.27 版本引入，在 Pod 进入 `activeQ` 队列之前被调用，仅将符合条件的 Pod 放入活动队列（Pod 的 `spec.schedulingGates` 字段为空），否则直接放入 `unschedulablePods` 队列中。
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

## Client-Go

### Client-Go 有哪几种客户端？

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410112137449.png)

client-go 支持 4 种客户端对象与 kube-apiserver 进行交互：

- **RESTClient** 是最基础的客户端，它主要对 HTTP 请求进行了封装，实现了 RESTful 风格的 API。ClientSet、DynamicClient 和 DiscoveryClient 都是基于 RESTClient 实现的。
- **ClientSet** 在 RESTClient 的基础上封装了 Resource 和 Version 的管理方法。每一个 Resource 可以被视为一个客户端，而 ClientSet 则是多个客户端的集合，每一个 Resource 和 Version 都以函数的方式暴露给用户。ClientSet 只能处理 Kubernetes 内置资源，不能直接访问 CRD 资源。如果想用 ClientSet 访问 CRD 资源，则可以通过 client-gen 代码生成器重新生成 ClientSet，在 ClientSet 中自动生成与 CRD 操作相关的接口。
- **DynamicClient** 能够处理 Kubernetes 的所有资源，包括 Kubernetes 内置资源和 CRD 资源。
- **DiscoveryClient** 用于发现 kube-apiserver 所支持的 Group、Versions 和 Resources。

有关 client-go 使用示例的完整代码可以在这里找到：[client-go](https://github.com/cr7258/hands-on-lab/tree/main/client-go/client)

#### RESTClient 使用示例

```go
// 配置 API 路径和请求的资源组/资源版本信息
config.APIPath = "/api"
config.GroupVersion = &corev1.SchemeGroupVersion

// 配置数据的编解码器
config.NegotiatedSerializer = scheme.Codecs

// 实例化 RESTClient 对象
restClient, err := rest.RESTClientFor(config)
if err != nil {
    panic(err)
}

// 预设返回值存放对象
result := &corev1.PodList{}

// Do 方法发起请求并用 Into 方法将 API Server 的返回结果写入 Result 对象中
err = restClient.Get().
    Namespace("default").
    Resource("pods").
    VersionedParams(&metav1.ListOptions{Limit: 500}, scheme.ParameterCodec).
    Do(context.Background()).
    Into(result)
```

#### ClientSet 使用示例

在 ClientSet 代码示例中，当使用 `kubernetes.NewForConfig` 函数初始化 ClientSet 客户端集合时，会级联构造出 CoreV1 资源组和资源版本的客户端集合对象（CoreV1Client）。
当使用 `clientset.CoreV1().Pods` 函数时会创建出 Pod 的专属客户端。

```go
clientset, err := kubernetes.NewForConfig(config)
if err != nil {
    panic(err)
}

podClient := clientset.CoreV1().Pods(apiv1.NamespaceDefault)
list, err := podClient.List(context.TODO(), metav1.ListOptions{Limit: 500})
```

#### DynamicClient 使用示例

DynamicClient 之所以能够处理 CRD 资源，其关键在于 DynamicClient 内部实现了 [Unstructured](https://github.com/kubernetes/apimachinery/blob/ea28d546a962e50982945e357ad9869cee15f291/pkg/runtime/interfaces.go#L362-L386)，用于处理非结构化数据（无法提前预知数据结构）。 

```go
dynamicClient, err := dynamic.NewForConfig(config)
if err != nil {
    panic(err)
}

gvr := schema.GroupVersionResource{Version: "v1", Resource: "pods"}
unstructObj, err := dynamicClient.Resource(gvr).Namespace("default").List(context.TODO(), metav1.ListOptions{Limit: 500})
if err != nil {
    panic(err)
}

list := &apiv1.PodList{}
err = runtime.DefaultUnstructuredConverter.FromUnstructured(unstructObj.UnstructuredContent(), list)
```

#### DiscoveryClient 使用示例

kubectl 命令行工具使用了 DiscoveryClient 的封装类 CachedDiscoveryClient，在第一次获取资源组、资源版本、资源信息时，会将响应缓存在本地磁盘，此后在缓存周期内再次获取资源信息时，会直接从本地缓存返回数据。CachedDiscoveryClient 的缓存信息默认存储在 `~/.kube/cache/discovery` 和 `~/.kube/cache/http` 目录中，默认缓存周期为 6 小时。

```go
discoveryClient, err := discovery.NewDiscoveryClientForConfig(config)
if err != nil {
    panic(err)
}

_, APIResourceList, err := discoveryClient.ServerGroupsAndResources()
if err != nil {
    panic(err)
}

for _, list := range APIResourceList {
    gv, err := schema.ParseGroupVersion(list.GroupVersion)
    if err != nil {
        panic(err)
    }

    for _, resource := range list.APIResources {
        fmt.Printf("name: %v, group: %v, version: %v\n", resource.Name, gv.Group, gv.Version)
    }
}
```

参考资料：深入理解 Kubernetes 源码 P200 ～ P214

### List 和 Watch 的实现原理

List-Watch 机制是 Kubernetes 的系统消息通知机制，该机制确保了消息的实时性、顺序性和可靠性。List 负责调用资源的 List RESTful API，基于 HTTP 短链接实现。

Watch 基于 HTTP 长链接实现，通过 HTTP/1.1 的分块传输编码（Chunked Transfer-Encoding）机制，在响应头中添加 `Transfer-Encoding: chunked` 字段，将数据分块传输给客户端。（在 HTTP2 中是基于 [Server Push](https://datatracker.ietf.org/doc/html/rfc9113#name-server-push) 实现的）

可以在访问 kube-apiserver 的 URL 后面添加 `?watch=true` 参数，即可开启 Watch 监听。例如：

```bash
# 绕过凭证验证
kubectl proxy --port 8080
curl http://localhost:8080/api/v1/namespaces/default/pods?watch=true
```

参考资料

- [Kubernetes Controller 机制详解（一）](https://www.zhaohuabing.com/post/2023-03-09-how-to-create-a-k8s-controller/)
- [Kubernetes List-Watch 机制原理与实现 - chunked](https://www.cnblogs.com/daniel-hutao/p/15424703.html)

### Informer 机制

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410121540747.png)

#### Reflector 数据同步

Reflector 的主要职责是从 kube-apiserver 拉取并持续监听（[ListAndWatch](https://github.com/kubernetes/client-go/blob/64f5574f09ee34521c63013855fb2eaac853012a/tools/cache/reflector.go#L348)） 相关资源类型的增删改 （Added/Updated/Deleted）事件，存储在由 DeltaFIFO 实现的本地缓存 (local store) 中，也就是 Indexer 中。

第一次拉取全量资源（目标资源类型)）后通过 [syncWith](https://github.com/kubernetes/client-go/blob/64f5574f09ee34521c63013855fb2eaac853012a/tools/cache/reflector.go#L599) 函数全量替换（Replace） 到 DeltaFIFO 的 queue/items 中，之后通过持续监听 Watch(目标资源类型) 增量事件，并去重更新到 DeltaFIFO queue/items 中，等待被消费。

#### DeltaFIFO 操作队列

[DeltaFIFO](https://github.com/kubernetes/client-go/blob/64f5574f09ee34521c63013855fb2eaac853012a/tools/cache/delta_fifo.go#L101) 在 Reflector 内部，它作为远端（API Server）和本地（Indexer、Listener）之间的传输桥梁。简单来说，它是一个生产者消费者队列，记录了资源对象的变化过程，拥有 FIFO 的特性，操作的资源对象为 Delta。每一个 Delta 包含一个操作类型和操作对象。

##### DeltaFIFO 使用示例

```go
package main

import (
	"k8s.io/client-go/tools/cache"
	"k8s.io/klog/v2"
)

type pod struct {
	Name  string
	Value float64
}

func newPod(name string, v float64) pod {
	return pod{
		Name:  name,
		Value: v,
	}
}

func podKeyFunc(obj interface{}) (string, error) {
	return obj.(pod).Name, nil
}

func main() {
	// 可以自定义 KeyFunc，默认使用 MetaNamespaceKeyFunc 生成的结果（<namespace>/<name>）作为 DeltaFIFO 的 key
	df := cache.NewDeltaFIFOWithOptions(cache.DeltaFIFOOptions{KeyFunction: podKeyFunc})
	pod1 := newPod("pod1", 1)
	pod2 := newPod("pod2", 2)
	pod3 := newPod("pod3", 3)
	df.Add(pod1)
	df.Add(pod2)
	df.Add(pod3)
	pod1.Value = 1.1
	df.Update(pod1)
	df.Delete(pod1)

	df.Pop(func(obj interface{}, isInInitialList bool) error {
		for _, delta := range obj.(cache.Deltas) {
			klog.Infof("delta type: %s, delta object: %s", delta.Type, delta.Object)
		}
		return nil
	})
}

// 运行程序输出结果如下，只可以取到最新的对象 pod1，旧值需要去 Indexer 里取
// I1012 12:03:54.863048    1437 deltafifo.go:38] delta type: Added, delta object: {pod1 %!s(float64=1)}
// I1012 12:03:54.863415    1437 deltafifo.go:38] delta type: Updated, delta object: {pod1 %!s(float64=1.1)}
// I1012 12:03:54.863429    1437 deltafifo.go:38] delta type: Deleted, delta object: {pod1 %!s(float64=1.1)}
```

##### DeltaFIFO 结构

DeltaFIFO 结构中的主要字段如下：

- `items`：用于存储资源对象的 Delta，key 为资源对象的 key，value 为 Delta。
- `queue`：用于存储资源对象的 key，保证资源对象的顺序。由于 map 是无序的，所以需要 `queue` 来保证资源对象的顺序。与 `items` 中的 key 一一对应（正常情况下 `queue` 与` items` 数量不多不少，刚好对应）。
- `keyFunc`：生成资源对象的 key 的方法。默认使用 `MetaNamespaceKeyFunc` 方法，生成的 key 为 `namespace/name`，如果资源对象没有 namespace，则 key 为 `name`。
- `KnownObjects`：knownObjects 就是 Indexer，里面存有已知全部的对象。

```go
type DeltaFIFO struct {
	// lock/cond protects access to 'items' and 'queue'.
	lock sync.RWMutex
	cond sync.Cond

	// `items` maps a key to a Deltas.
	// Each such Deltas has at least one Delta.
	items map[string]Deltas

	// `queue` maintains FIFO order of keys for consumption in Pop().
	// There are no duplicates in `queue`.
	// A key is in `queue` if and only if it is in `items`.
	queue []string

	// populated is true if the first batch of items inserted by Replace() has been populated
	// or Delete/Add/Update/AddIfNotPresent was called first.
	populated bool
	// initialPopulationCount is the number of items inserted by the first call of Replace()
	initialPopulationCount int

	// keyFunc is used to make the key used for queued item
	// insertion and retrieval, and should be deterministic.
	keyFunc KeyFunc

	// knownObjects list keys that are "known" --- affecting Delete(),
	// Replace(), and Resync()
	knownObjects KeyListerGetter

	// Used to indicate a queue is closed so a control loop can exit when a queue is empty.
	// Currently, not used to gate any of CRUD operations.
	closed bool

	// emitDeltaTypeReplaced is whether to emit the Replaced or Sync
	// DeltaType when Replace() is called (to preserve backwards compat).
	emitDeltaTypeReplaced bool

	// Called with every object if non-nil.
	transformer TransformFunc
}
```

每个 [Delta](https://github.com/kubernetes/client-go/blob/64f5574f09ee34521c63013855fb2eaac853012a/tools/cache/delta_fifo.go#L184) 的结构如下，其中包含 Type（操作类型）和 Object（操作对象，例如 Pod）两个字段：

```go
type Delta struct {
	Type   DeltaType
	Object interface{}
}
```

Type 的类型如下：

- Added ：增加
- Updated：更新
- Deleted：删除
- Replaced：重新 list（relist），这个状态是由于 watch event 出错，导致需要进行 relist 来进行全盘同步。需要设置 `EmitDeltaTypeReplaced=true` 才能显示这个状态，否为默认为 Sync。
- Sync：本地同步

```go
const (
	Added   DeltaType = "Added"
	Updated DeltaType = "Updated"
	Deleted DeltaType = "Deleted"
	// Replaced is emitted when we encountered watch errors and had to do a
	// relist. We don't know if the replaced object has changed.
	//
	// NOTE: Previous versions of DeltaFIFO would use Sync for Replace events
	// as well. Hence, Replaced is only emitted when the option
	// EmitDeltaTypeReplaced is true.
	Replaced DeltaType = "Replaced"
	// Sync is for synthetic events during a periodic resync.
	Sync DeltaType = "Sync"
)
```

下面可视化 DeltaFIFO 中最主要的两个存储结构 `queue` 和 `items`。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410121535401.png)

DeltaFIFO 的职责是通过队列加锁处理（queueActionLocked）、去重（dedupDeltas）、存储在由 DeltaFIFO 实现的本地存储（Indexer） 中，包括 queue （仅存 objKeys） 和 items（存 objKeys 和对应的 Deltas 增量变化），并通过 Pop 不断消费，通过 Process（item）处理相关逻辑。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410121540719.png)

##### 为什么使用 DeltaFIFO，而不是直接使用一个 FIFO？

最重要的就是合并请求。也就是在 queue 中的 key 被不断 Pop 处理的过程中，会有大量同一个 Obj 的请求到来，这些请求可能散布在整个请求流中，也即是不是连续的。比如下面的例子：在 7 次请求中，包含 4 次对 Obj1 的请求，请求顺序如下：1->20->1->1->3->5->1，如果直接使用 FIFO，那么在处理完第一个 Obj1 之后，需要处理 Obj20，之后又需要处理 Obj1 的请求，后续同理，这样对 Obj 1 重复多次做了处理，这不是我们希望的。所以在 DeltaFIFO 中，我们将这一时间段内对同一个 Obj 的请求都合并为 Deltas，每一次的请求作为其中的一个 Delta。这里的一段时间指的是这个 Obj 对应的 key 入队列 queue 开始到出队列的这段时间内。


参考资料：

- [articles/Informer机制 - DeltaFIFO.md](https://github.com/k8s-club/k8s-club/blob/main/articles/Informer%E6%9C%BA%E5%88%B6%20-%20DeltaFIFO.md)
- [articles/K8s 系列(四) - 浅谈 Informer.md](https://github.com/k8s-club/k8s-club/blob/main/articles/K8s%20%E7%B3%BB%E5%88%97(%E5%9B%9B)%20-%20%E6%B5%85%E8%B0%88%20Informer.md)

#### Indexer 资源缓存

Indexer 是 client-go 用来存储资源对象并自带索引功能的本地存储，Reflector 从 DeltaFIFO 中将消费出来的资源对象存储至 Indexer。Indexer 中的数据与 etcd 集群中的数据保持完全一致。client-go 可以很方便地从本地存储中读取相应的资源对象数据，而无须每次都从远程 etcd 集群中读取，这样可以减轻 kube-apiserver 和 etcd 集群的压力。

##### Indexer 使用示例

Indexer 的使用示例如下：

```go
package main

import (
	"fmt"

	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/tools/cache"
)

const (
	NamespaceIndexName = "namespace"
	NodeNameIndexName  = "nodeName"
)

func NamespaceIndexFunc(obj interface{}) ([]string, error) {
	m, err := meta.Accessor(obj)
	if err != nil {
		return []string{""}, fmt.Errorf("object has no meta: %v", err)
	}
	return []string{m.GetNamespace()}, nil
}

func NodeNameIndexFunc(obj interface{}) ([]string, error) {
	pod, ok := obj.(*v1.Pod)
	if !ok {
		return []string{}, nil
	}
	return []string{pod.Spec.NodeName}, nil
}

func main() {
	// 对象的 objKey 由 MetaNamespaceKeyFunc 函数生成
	// 另外自定义了两个 IndexFunc 的 NamespaceIndexFunc 和 NodeNameIndexFunc，分别根据资源对象的命名空间和节点名称生成索引值列表
	index := cache.NewIndexer(cache.MetaNamespaceKeyFunc, cache.Indexers{
		NamespaceIndexName: NamespaceIndexFunc,
		NodeNameIndexName:  NodeNameIndexFunc,
	})

	pod1 := &v1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "pod-1",
			Namespace: "default",
		},
		Spec: v1.PodSpec{NodeName: "node1"},
	}
	pod2 := &v1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "pod-2",
			Namespace: "default",
		},
		Spec: v1.PodSpec{NodeName: "node2"},
	}
	pod3 := &v1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "pod-3",
			Namespace: "kube-system",
		},
		Spec: v1.PodSpec{NodeName: "node2"},
	}

	_ = index.Add(pod1)
	_ = index.Add(pod2)
	_ = index.Add(pod3)

	// ByIndex 两个参数：IndexName（索引器名称）和 indexKey（需要检索的key）
	fmt.Println("=========== NamespaceIndexFunc ==============")
	pods, err := index.ByIndex(NamespaceIndexName, "default")
	if err != nil {
		panic(err)
	}
	for _, pod := range pods {
		fmt.Println(pod.(*v1.Pod).Name)
	}

	fmt.Println("=========== NodeNameIndexFunc ==============")
	pods, err = index.ByIndex(NodeNameIndexName, "node2")
	if err != nil {
		panic(err)
	}
	for _, pod := range pods {
		fmt.Println(pod.(*v1.Pod).Name)
	}

	fmt.Println("=========== MetaNamespaceKeyFunc ===============")
	// 直接通过 <namespace>/<name> 的 key 来获取对象
	obj, _, _ := index.GetByKey("default/pod-2")
	fmt.Println(obj.(*v1.Pod).Name)
}

// 输出结果为：
//=========== NamespaceIndexFunc ==============
//pod-1
//pod-2
//=========== NodeNameIndexFunc ==============
//pod-3
//pod-2
//=========== MetaNamespaceKeyFunc ===============
//pod-2
```

在上面的示例中首先通过 `NewIndexer` 函数实例化 Indexer 对象，第一个参数就是用于计算资源对象键的函数，这里我们使用的是 `MetaNamespaceKeyFunc` 这个默认的对象键函数；第二个参数是 Indexers，里面包含了我们自定义的两个 IndexFunc：`NamespaceIndexFunc` 与 `NodeNameIndexFunc`，一个根据资源对象的命名空间来进行索引，一个根据资源对象所在的节点进行索引。

然后定义了 3 个 Pod，前两个在 default 命名空间下面，另外一个在 kube-system 命名空间下面，然后通过 `index.Add` 函数添加这 3 个 Pod 资源对象。然后通过 `index.ByIndex` 函数查询在名为 namespace 的 Index 下面匹配 IndexedValue 为 default 的 Pod 列表。也就是查询 default 这个命名空间下面的所有 Pod，这里就是前两个定义的 Pod。

##### IndexFunc, Index, Indexers 和 Indices 

Indexer 中有几个非常重要的概念：

```go
// IndexFunc knows how to compute the set of indexed values for an object.
type IndexFunc func(obj interface{}) ([]string, error)

// Index maps the indexed value to a set of keys in the store that match on that value
type Index map[string]sets.String

// Indexers maps a name to an IndexFunc
type Indexers map[string]IndexFunc

// Indices maps a name to an Index
type Indices map[string]Index
```

- IndexFunc 用于计算一个资源对象的索引值列表，上面示例是指定创建 "namespace" 和 "nodeName" 2 个索引，当然我们也可以根据需求定义其他的，比如根据 Label 标签、Annotation 等属性来生成索引值列表。
- Index 是实际的索引，key 是 [indexedValue](https://github.com/kubernetes/client-go/blob/64f5574f09ee34521c63013855fb2eaac853012a/tools/cache/index.go#L44)（在 "namespace" 索引中有两个 indexedValue：default, kube-system），value 是 objKey（默认使用 MetaNamespaceKeyFunc 函数计算，例如 default/pod-1, kube-system/pod-3） ，对于上面的示例，我们要查找某个命名空间下面的 Pod，那就要让 Pod 按照其命名空间进行索引，对应的 Index 类型就是 map[namespace]sets.pod。
- Indexers 用于查找 IndexFunc，key 为 [indexName](https://github.com/kubernetes/client-go/blob/64f5574f09ee34521c63013855fb2eaac853012a/tools/cache/index.go#L40)（例如 "namespace"），value 为 indexName 对应的 IndexFunc，上面的示例就是 map["namespace"]MetaNamespaceIndexFunc。
- Indices：用于查找 Index，key 为 indexName, value 为 indexName 对应的 Index，对于上面的示例就是 map["namespace"]map[namespace]sets.pod。

按照上面的理解我们可以得到上面示例的索引数据如下所示：

```json
// Indexers 包含了所有的 IndexFunc
Indexers: {  
  "namespace": NamespaceIndexFunc, // IndexFunc
  "nodeName": NodeNameIndexFunc, // IndexFunc
}
// Indices 包含了所有的 Index
Indices: {
 "namespace": {  // Index
  "default": ["pod-1", "pod-2"], // Index 中的一条记录，key 是 IndexedValue，value 是 objKey
  "kube-system": ["pod-3"]
 },
 "nodeName": {  // Index
  "node1": ["pod-1"], 
  "node2": ["pod-2", "pod-3"]
 }
}
```

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410121933684.png)

对于 Kubernetes 资源对象的新增操作来说，其建立索引并存储的过程如下：

- 1.将新增的对象存储到 [threadSafeMap 的 items](https://github.com/kubernetes/client-go/blob/64f5574f09ee34521c63013855fb2eaac853012a/tools/cache/thread_safe_store.go#L240) 中，key 是 对象的 objKey（默认使用 MetaNamespaceKeyFunc 函数计算），value 为对象本身。
- 2.[遍历 Indexers 中的 indexFunc 列表](https://github.com/kubernetes/client-go/blob/v0.28.3/tools/cache/thread_safe_store.go#L146)，为新增的对象应用所有的 indexFunc 函数计算出不同 Index 下的 indexedValue。例如，假设我们设置了 `NamespaceIndexFunc` 和 `NodeNameIndexFunc` 两个 indexFunc 函数，那么对于新增的 pod-4 对象，在 Index `namespace` 下的 indexedValue 为 `default`，在 Index `nodeName` 下的 indexedValue 为 `node-1`。
- 3.[根据 IndexName 在 Indices 中找到对应的 Index](https://github.com/kubernetes/client-go/blob/v0.28.3/tools/cache/thread_safe_store.go#L165)，将新增的对象 objKey 添加到 Index 中。 

##### Indexer 接口实现

[Indexer](https://github.com/kubernetes/client-go/blob/64f5574f09ee34521c63013855fb2eaac853012a/tools/cache/index.go#L35) 定义了两方面的接口：

- 第一类为存储类型的接口 `Store`，包含了 `Add`、`Update`、`Delete`、`List`、`ListKeys`、`Get`、`GetByKey`、`Replace`、`Resync` 等数据存储、读取的常规操作。
- 第二类为索引类型的接口，(方法名中包含 Index)。

```go
type Indexer interface {
	Store
	// Index returns the stored objects whose set of indexed values
	// intersects the set of indexed values of the given object, for
	// the named index
	Index(indexName string, obj interface{}) ([]interface{}, error)
	// IndexKeys returns the storage keys of the stored objects whose
	// set of indexed values for the named index includes the given
	// indexed value
	IndexKeys(indexName, indexedValue string) ([]string, error)
	// ListIndexFuncValues returns all the indexed values of the given index
	ListIndexFuncValues(indexName string) []string
	// ByIndex returns the stored objects whose set of indexed values
	// for the named index includes the given indexed value
	ByIndex(indexName, indexedValue string) ([]interface{}, error)
	// GetIndexers return the indexers
	GetIndexers() Indexers

	// AddIndexers adds more indexers to this store.  If you call this after you already have data
	// in the store, the results are undefined.
	AddIndexers(newIndexers Indexers) error
}
```

[cache](https://github.com/kubernetes/client-go/blob/64f5574f09ee34521c63013855fb2eaac853012a/tools/cache/store.go#L158) 实现了 Indexer 接口，内部定义了 ThreadSafeStore 接口类型的 cacheStorage，用来实现基于索引的本地存储。

```go
// `*cache` implements Indexer in terms of a ThreadSafeStore and an
// associated KeyFunc.
type cache struct {
	// ThreadSafeStore由 threadSafeMap 实现
	cacheStorage ThreadSafeStore
	//默认使用 MetaNamespaceKeyFunc 也即是 key 为namespace/name
	keyFunc KeyFunc
}
```

[ThreadSafeStore](https://github.com/kubernetes/client-go/blob/master/tools/cache/thread_safe_store.go#L41) 接口定义了常规的存储、读取、更新接口，以及对于索引的一些接口。

```go
type ThreadSafeStore interface {
	Add(key string, obj interface{})
	Update(key string, obj interface{})
	Delete(key string)
	Get(key string) (item interface{}, exists bool)
	List() []interface{}
	ListKeys() []string
	Replace(map[string]interface{}, string)
	Index(indexName string, obj interface{}) ([]interface{}, error)
	IndexKeys(indexName, indexedValue string) ([]string, error)
	ListIndexFuncValues(name string) []string
	ByIndex(indexName, indexedValue string) ([]interface{}, error)
	GetIndexers() Indexers

	// AddIndexers adds more indexers to this store. This supports adding indexes after the store already has items.
	AddIndexers(newIndexers Indexers) error
	// Resync is a no-op and is deprecated
	Resync() error
}
```

[threadSafeMap](https://github.com/kubernetes/client-go/blob/master/tools/cache/thread_safe_store.go#L224) 实现了 ThreadSafeStore 接口，此处为真正实现 local store (Indexer) 的地方，通过 `items` 来存储数据、indexers 来存储索引方法、indices 来存储索引，实现基于索引的存储。并实现了实现了 ThreadSafeStore 的所有接口。

```go
// threadSafeMap implements ThreadSafeStore
type threadSafeMap struct {
	lock  sync.RWMutex
	items map[string]interface{}

	// index implements the indexing functionality
	index *storeIndex
}
```

参考资料：

- [client-go 之 Indexer 的理解](https://cloud.tencent.com/developer/article/1692517)
- [Client-Go 之 Indexer 原理分析及示例演示](https://www.bilibili.com/video/BV1AG411b72E/?spm_id_from=333.788&vd_source=1c0f4059dae237b29416579c3a5d326e)
- [K8s源码分析(23)-indexer及index和indices组件](https://cloud.tencent.com/developer/article/2144571)
- [k8s-club/articles/Informer机制 - Indexer.md](https://github.com/k8s-club/k8s-club/blob/main/articles/Informer%E6%9C%BA%E5%88%B6%20-%20Indexer.md#%E9%87%8D%E7%82%B9%E6%A6%82%E5%BF%B5)
- [深入源码分析 kubernetes client-go list-watch 和 informer 机制的实现原理](https://github.com/rfyiamcool/notes/blob/main/kubernetes_client_go_informer.md)
- 深入理解 Kubernetes 源码 P227

#### Processor 资源处理

从 DeltaFIFO 中推送的资源对象的操作记录，除了交由 Indexer 存储至本地缓存，还会一并推送给 processor，最终交由 Informer 机制的使用方处理。

#### Workqueue 工作队列

workqueue 支持 3 种队列，并且提供了 3 种接口，不同队列实现可应对不同的使用场景。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410131142640.png)

- [Interface](https://github.com/kubernetes/client-go/blob/release-1.25/util/workqueue/queue.go#L26-L34)：FIFO 通用队列接口，先进先出队列，并且支持去重机制。

```go
type Interface interface {
	Add(item interface{})
	Len() int
	Get() (item interface{}, shutdown bool)
	Done(item interface{})
	ShutDown()
	ShutDownWithDrain()
	ShuttingDown() bool
}
```

- [DelayingInterface](https://github.com/kubernetes/client-go/blob/release-1.25/util/workqueue/delaying_queue.go#L28-L34)：延迟队列接口，基于 [Interface](https://github.com/kubernetes/client-go/blob/release-1.25/util/workqueue/queue.go#L26-L34) 接口封装，`AddAfter` 方法允许延迟一段时间后再将元素插入队列。

```go
// DelayingInterface is an Interface that can Add an item at a later time. This makes it easier to
// requeue items after failures without ending up in a hot-loop.
type DelayingInterface interface {
	Interface
	// AddAfter adds an item to the workqueue after the indicated duration has passed
	AddAfter(item interface{}, duration time.Duration)
}
```

- [RateLimitingInterface](https://github.com/kubernetes/client-go/blob/release-1.25/util/workqueue/rate_limiting_queue.go#L19-L33)：限速队列接口，基于 [DelayingInterface](https://github.com/kubernetes/client-go/blob/release-1.25/util/workqueue/delaying_queue.go#L28-L34) 接口封装，支持在将元素插入队列时进行速率限制。

```go
// RateLimitingInterface is an interface that rate limits items being added to the queue.
type RateLimitingInterface interface {
	DelayingInterface

	// AddRateLimited adds an item to the workqueue after the rate limiter says it's ok
	AddRateLimited(item interface{})

	// Forget indicates that an item is finished being retried.  Doesn't matter whether it's for perm failing
	// or for success, we'll stop the rate limiter from tracking it.  This only clears the `rateLimiter`, you
	// still have to call `Done` on the queue.
	Forget(item interface{})

	// NumRequeues returns back how many times the item was requeued
	NumRequeues(item interface{}) int
}
```

##### FIFO 通用队列实现

FIFO 通用队列数据结构中最主要的字段有 `queue`、`dirty`、`processing`，通过这个 `dirty` 和 `processing` 两个字段实现了去重的功能。

- `queue` 用来实现顺序存储元素的, 其结构为 slice 切片类型, 元素类型为 interface{} 任意类型。`queue` 读写流程为读 slice 的头部, 写 slice 的尾部。 `queue` 是 FIFO 先进先出的设计。
- `dirty` 是用来实现去重的，主要是为了避免重复消费元素。当添加元素时（不管元素是待处理，还是正常被处理），如果 `dirty` 中已含有该元素则直接返回。
- `processing` 也是用来去重的，用于标记一个元素是否正在被处理，其主要是为了避免元素被并发处理。

```go
// Type is a work queue (see the package comment).
type Type struct {
	// queue defines the order in which we will work on items. Every
	// element of queue should be in the dirty set and not in the
	// processing set.
	queue []t

	// dirty defines all of the items that need to be processed.
	dirty set

	// Things that are currently being processed are in the processing set.
	// These things may be simultaneously in the dirty set. When we finish
	// processing something and remove it from this set, we'll check if
	// it's in the dirty set, and if so, add it to the queue.
	processing set

	cond *sync.Cond

	shuttingDown bool
	drain        bool

	metrics queueMetrics

	unfinishedWorkUpdatePeriod time.Duration
	clock                      clock.WithTicker
}
```

###### FIFO 通用队列存储过程

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410131435502.png)

例如上图所示为 FIFO 的存储过程，通过 `Add` 方法向 FIFO 队列中分别插入 1，2，3 这 3 个元素，此时队列中的 `queue` 和 `dirty` 字段分别存有 1，2，3 元素，`processing` 字段为空。

然后通过 `Get` 方法获取最先进入的元素（元素1），此时队列中的 `queue` 和 `dirty` 字段分别存有 2，3；元素 1 被放入 `processing` 字段中，说明它正在被处理。最后处理完元素 1 时，通过 `Done` 方法将其标记为处理完成，此时队列中的 `processing` 字段中的 1 元素被删除。

###### FIFO 通用队列并发存储过程

但是在并发存储下，如何保证处理一个元素之前哪怕被添加多次，也只是处理一次？下图为 FIFO 并发存储的过程。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410131438514.png)

在并发场景下，goroutine A 通过 `Get` 方法获取元素 1，元素 1 被添加到 `processing` 字段中，同一时间，goroutine B 通过 `Add` 方法插入另一个 1 元素，此时在 `processing` 字段中已经存在相同的元素，所以后面后面的元素 1 不会被直接插入到 `queue` 字段中，而是存入 `dirty` 字段中；在 goroutine A 通过 `Done` 方法标记处理完元素 1 后，如果 `dirty` 字段中存有元素 1，则将其追加到 `queue` 字段的尾部，`dirty` 和 `processing` 字段都是 HashMap 数据结构实现的，不考虑无序，只考虑去重。

###### FIFO 通用队列主要方法

`Add()` 是将元素插入到队列的方法。插入元素的流程原理如下：

- 判断 `dirty` 是否存在该元素，如存在则直接跳出，其目的是为了实现待处理元素的去重效果。
- 然后在 `dirty` 里添加元素，再判断 `processing` 集合是否存在元素，如果存在则跳出。其目的是为了防止同一个元素被并发处理。
- 在 `processing` 集合里加入元素。
- 使用 cond signal 唤醒其他陷入阻塞的协程。

```go
func (q *Type) Add(item interface{}) {
    // 加锁保证并发安全
    q.cond.L.Lock()
    defer q.cond.L.Unlock()

    // 已关闭直接退出
    if q.shuttingDown {
        return
    }

    // 如果 dirty 已存在，则直接退出，dirty 是为了实现待消费元素的去重。
    if q.dirty.has(item) {
        return
    }

    // 增加 add 的指标
    q.metrics.add(item)

    // 每次 add 的元素也要放到 dirty 集合里，为了去重效果。
    q.dirty.insert(item)

    // 如果这个元素正在处理, 那么在把元素放到 dirty 后就完事了。后面由 Done 方法来处理 dirty -> queue 的逻辑。
    if q.processing.has(item) {
        return
    }

    // 把元素放到队列里
    q.queue = append(q.queue, item)

    // 通知等待的协程处理任务
    q.cond.Signal()
}
```

`Get()` 是获取元素的方法，从队列的头部获取最先入队的元素。然后在 `processing` 集合中添加元素，其目的就是为了防止同一个元素对象被并发处理。最后从 `dirty` 集合里删除对象，因为 `dirty` 是为了实现的待消费去重，既然从 `queue` 拿走元素，`dirty` 也需要删除。

```go
func (q *Type) Get() (item interface{}, shutdown bool) {
    // 线程安全
    q.cond.L.Lock()
    defer q.cond.L.Unlock()

    // 如果队列为空则陷入 cond 等待
    for len(q.queue) == 0 && !q.shuttingDown {
        q.cond.Wait()
    }

    // 如果关闭了且队列为空，直接 return
    if len(q.queue) == 0 {
        return nil, true
    }

    // 从头部获取元素
    item = q.queue[0]
    q.queue[0] = nil

    // 重新引用切片
    q.queue = q.queue[1:]

    // 统计 metrics get 指标
    q.metrics.get(item)

    // 从 dirty set 里去除，加到 processing 集合里
    q.processing.insert(item)
    q.dirty.delete(item)

    return item, false
}
```

`Done()` 用来标记某元素已经处理完，可以从 `processing` 集合中去除，然后判断 `dirty` 集合中是否有该对象，如果存在则把该对象推到 `queue` 里再次入队。

如果一个元素正在被处理，这时候如果再次添加同一个元素，由于该元素还在处理未完成，只能把对象放到 `dirty` 里。为什么不放到 `queue` 里？因为放 `queue` 里的话，在并发消费场景下，同一个元素会被多个协程并发处理。当执行完毕调用 `Done()` 时，会把 `dirty` 的任务重新入队，起到了排队的效果。

```go
func (q *Type) Done(item interface{}) {
    // 线程安全
    q.cond.L.Lock()
    defer q.cond.L.Unlock()

    // 统计 metrics done 指标
    q.metrics.done(item)

    // 从 processing 集合中剔除
    q.processing.delete(item)

    // 如果 dirty 还有，那么把该元素加到 queue 队列里
    if q.dirty.has(item) {
        q.queue = append(q.queue, item)
        q.cond.Signal()
    } else if q.processing.len() == 0 {
        q.cond.Signal()
    }
}
```

FIFO 通用队列的使用示例可以在这里找到：[workqueue.go](https://github.com/cr7258/hands-on-lab/blob/main/client-go/workqueue/workqueue.go)

##### 延迟队列

延迟队列是基于 FIFO 队列接口封装的，在原有功能上增加了 `AddAfter` 方法，其原理是延迟一段时间后再将元素插入 FIFO 队列。

```go
// delayingType wraps an Interface and provides delayed re-enquing
type delayingType struct {
	Interface

	// clock tracks time for delayed firing
	clock clock.Clock

	// stopCh lets us signal a shutdown to the waiting loop
	stopCh chan struct{}
	// stopOnce guarantees we only signal shutdown a single time
	stopOnce sync.Once

	// heartbeat ensures we wait no more than maxWait before firing
	heartbeat clock.Ticker

	// waitingForAddCh is a buffered channel that feeds waitingForAdd
	waitingForAddCh chan *waitFor

	// metrics counts the number of retries
	metrics retryMetrics
}
```

`delayingType` 结构中最主要的字段是 `waitingForAddCh`，其默认初始大小为 1000，在通过 `AddAfter` 方法插入元素时，是非阻塞状态的，只有当插入的元素大于或等于 1000 时，延迟队列才会处于阻塞状态。`waitingForAddCh` 字段中的数据通过 goroutine 运行的 [waitingLoop](https://github.com/kubernetes/client-go/blob/release-1.25/util/workqueue/delaying_queue.go#L189) 函数持久运行。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410132109043.png)

如上图所示，将元素 1 插入 `waitingForAddCh` 字段中，通过 `waitingLoop` 函数消费元素数据。当元素的处理时间 `readyAt` 大于当前时间，说明需要延迟将元素插入 FIFO 通用队列，此时将该元素放入优先队列（`waitForPriorityQueue`）中。当元素处理时间小于或等于当前时间时，说明该元素需要立即处理，此时将元素直接插入 FIFO 通用队列。此外，`waitingLoop` 函数还会不断遍历优先队列中的元素，将已经达到处理时间的元素插入 FIFO 通用队列。

延迟队列的使用示例可以在这里找到：[delayworkqueue.go](https://github.com/cr7258/hands-on-lab/blob/main/client-go/workqueue/delayworkqueue.go)

##### 限速队列

限速对列是基于延迟队列和 FIFO 队列接口封装，限速队列接口（[RateLimitingInterface](https://github.com/kubernetes/client-go/blob/release-1.25/util/workqueue/rate_limiting_queue.go#L20)）在原有功能上增加了 `AddRateLimited`、`Forget`、`NumRequeues` 方法。

```go
// RateLimitingInterface is an interface that rate limits items being added to the queue.
type RateLimitingInterface interface {
	DelayingInterface

	// AddRateLimited adds an item to the workqueue after the rate limiter says it's ok
	AddRateLimited(item interface{})

	// Forget indicates that an item is finished being retried.  Doesn't matter whether it's for perm failing
	// or for success, we'll stop the rate limiter from tracking it.  This only clears the `rateLimiter`, you
	// still have to call `Done` on the queue.
	Forget(item interface{})

	// NumRequeues returns back how many times the item was requeued
	NumRequeues(item interface{}) int
}
```

在创建限速队列时，可以传入不同的限速器 [RateLimiter](https://github.com/kubernetes/client-go/blob/release-1.25/util/workqueue/default_rate_limiters.go#L27) 实现，官方提供 4 种限速器，分别应对不同的场景，包括令牌桶算法（BucketRateLimiter）、排队指数算法（ItemExponentialFailureRateLimiter）、计数器算法（ItemFastSlowRateLimiter）和混合算法（MaxOfRateLimiter）。

```go
type RateLimiter interface {
	// When gets an item and gets to decide how long that item should wait
	When(item interface{}) time.Duration
	// Forget indicates that an item is finished being retried.  Doesn't matter whether it's for failing
	// or for success, we'll stop tracking it
	Forget(item interface{})
	// NumRequeues returns back how many failures the item has had
	NumRequeues(item interface{}) int
}
```

其中 `MaxOfRateLimiter` 实例化时可以传入多个 RateLimiter 限速器实例，使用 `When()` 求等待间隔时，然后选择最大的等待间隔。

```go
// 我们定义了一个复合的限速器，它结合了两种限速策略：
// 1. 使用指数退避的限速器，用于限制每个任务的重试频率
// 2. 使用令牌桶算法限制总体速率，这里设置为每秒 5 个请求。
// MaxOfRateLimiter 会遍历所有的 RateLimiter 示例，使用 When() 计算等待间隔，然后选择最大的等待间隔。
limiter := workqueue.NewMaxOfRateLimiter(
    workqueue.NewItemExponentialFailureRateLimiter(time.Millisecond, 1000*time.Millisecond),
    &workqueue.BucketRateLimiter{Limiter: rate.NewLimiter(rate.Limit(5), 5)},
)
```

限速队列的使用示例可以在这里找到：[ratelimitworkqueue.go](https://github.com/cr7258/hands-on-lab/blob/main/client-go/workqueue/ratelimitworkqueue.go)

- [源码分析 kubernetes client-go workqueue 的实现原理](https://xiaorui.cc/archives/7363)
- 深入理解 Kubernetes 源码 P233 ~ P240

##### 为什么 Controller 不直接从 Informer 中获取资源对象进行处理，而是从 Workqueue 中获取对象的 objKey 进行处理？

因为每个 obj 在 Kubernetes 各组件内经过 Reconcile，obj 随时都在进行变化。Informer 中对象是以 key-accumulator 方式存储，即一个 obj 随着时间的变化存在很多版本，通过取 key 间接取到最新的 obj，保证了取到的 obj 是实时最新的对象。

另外，为什么在 Controller 内使用 WorkQueue，还有以下两点考虑：

- 避免 OOM。具体来说，是提升 Controller（Listener） 处理（接收）事件的速率，（直接放入WorkQueue，比完成复杂的 Reconcile 流程要快很多很多），这样就能避免 Informer 框架内的 processorListener 在向当前这个 Listener/Controller 派发事件时，向 pendingNotifications 中堆积过多事件，从而引发 OOM。
- 减少 Reconcile 次数，避免多次无意义的 Reconcile。通过 WorkQueue 内部的实现机制，能够保证在处理一个 obj 之前哪怕其被添加了多次（在短时间内大量到来等），也只会被处理一次，极大的减少了 Reconcile 的次数。同时每次 Reconcile 从 Indexer 中取最新的 obj，而不是直接使用被通知的 obj，能够避免无意义的 Reconcile。

参考资料：[在掌握 K8s 路上，应该理解下面这些 QA](https://github.com/k8s-club/k8s-club/blob/c742e2234a7898f6524046cd7c40ffc95e2b0f71/articles/QA%20to%20Understand%20K8s.md)


#### Resync 机制的作用是什么？

resync 的目的是为了让 listener 能够定期 reconcile Indexer 内的所有事件，来保证对应事件关心的对象（可能是系统内，也可能是系统外）状态都是预期状态。如果此时 reconcile 过程中发现对象状态不是预期状态，就会驱动其向预期状态发展。

一个易理解的例子：我们实现了一个 listener，其会通过对象描述的磁盘规格（大小，类型等等）来向云服务商购买对应的磁盘。对于对象 A 而言，listener 在第一次 reconcile 对象 A 时，通过调用云服务商的接口，购买了其对应规格的磁盘，并在购买完成之后，在对象 A 的 status 中添加上了购买完成的信息，之后本轮 reconcile 就结束了。之后，用户通过云服务商控制台将磁盘误删除了，但是此时 listener 是感知不到这个操作的，并且对象 A 的 status 中一直维持着购买成功的信息，这可能会导致依赖这个 status 的程序出现意外的错误。在这种场景下，通过 resync 功能，在 listener 的同步时间到达之后，就会重新处理对象 A，此时 listener 发现控制台上并没有该磁盘，就会重新调用接口再创建一次，这样就将用户在控制台误删除的动作给修正了）

参考资料：

- [articles/Informer机制 - Resync.md](https://github.com/k8s-club/k8s-club/blob/main/articles/Informer%E6%9C%BA%E5%88%B6%20-%20Resync.md)


### 使用 Informer，Controller runtime 和 Kubebuilder 来编写 Controller 的区别

- 直接使用 Informer：直接使用 Informer 编写 Controller 需要编写更多的代码，因为我们需要在代码处理更多的底层细节，例如如何在集群中监视资源，以及如何处理资源变化的通知。但是，使用 Informer 也可以更加自定义和灵活，因为我们可以更细粒度地控制 Controller 的行为。

- Controller runtime：Controller runtime 是基于 Informer 实现的，在 Informer 之上为 Controller 编写提供了高级别的抽象和帮助类，包括 Leader Election、Event Handling 和 Reconcile Loop 等等。使用 Controller runtime，可以更容易地编写和测试 Controller，因为它已经处理了许多底层的细节。

- Kubebuilder：和 Informer 及 Controller runtime 不同，Kubebuilder 并不是一个代码库，而是一个开发框架。Kubebuilder 底层使用了 controller-runtime。Kubebuilder 提供了 CRD 生成器和代码生成器等工具，可以帮助开发者自动生成一些重复性的代码和资源定义，提高开发效率。同时，Kubebuilder 还可以生成 Webhooks，以用于验证自定义资源。

参考资料：[Kubernetes Controller 机制详解（一）：Kubernetes API List/Watch 机制 与 Informer 客户端库](https://www.zhaohuabing.com/post/2023-03-09-how-to-create-a-k8s-controller/)

## 其他

### Pod 的终止流程

- Pod 被删除，状态变为 Terminating。从 API 层面看就是 Pod metadata 中的 deletionTimestamp 字段会被标记上删除时间。
- Endpoint Controller 会将 Pod 从 Service 的 endpoint 列表中摘除掉，kube-proxy 根据 endpoint 更新转发规则，新的流量不再转发到该 Pod。
- kubelet watch 到了就开始销毁 Pod。
  - 如果 Pod 中有 container 配置了 preStop Hook ，将会执行。
  - 发送 SIGTERM 信号给容器内主进程以通知容器进程开始优雅停止。
  - 等待 container 中的主进程完全停止，如果在 `terminationGracePeriodSeconds` 内 (默认 30s) 还未完全停止，就发送 SIGKILL 信号将其强制杀死。
  - 所有容器进程终止，清理 Pod 资源。
  - 通知 API Server Pod 销毁完成，完成 Pod 删除。

参考资料：

- [Pod 终止流程](https://imroc.cc/kubernetes/best-practices/graceful-shutdown/pod-termination-proccess)
- [Kubernetes Pod 删除操作源码解析](https://cloud.tencent.com/developer/article/2008313)

