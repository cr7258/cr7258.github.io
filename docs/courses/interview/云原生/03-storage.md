---
title: 存储
author: Se7en
categories:
  - Interview
tags:
  - Storage
---


## CSI (Container Storage Interface)

### CSI 可以分成哪几个部分？

CSI 可以分成两部分：Controller Server（Deployment） 和 Node Server（DaemonSet）。

- Controller Server：主要负责一些无需在宿主机上执行的操作，这也是与 Node Server 最根本的区别。用于实现创建/删除 volume、attach/detach volume、volume 快照、volume 扩缩容等功能。以 CreateVolume 为例，k8s 通过调用该方法创建底层存储。比如底层使用了某云供应商的云硬盘服务，开发者在 CreateVolume 方法实现中应该调用云硬盘服务的创建/订购云硬盘的 API，调用 API 这个操作是不需要在特定宿主机上执行的。
- Node Server：定义了需要在宿主机上执行的操作，比如：mount、unmount。在前面的部署架构图中，Node Service 使用 Daemonset 的方式部署，也是为了确保 Node Server 会被运行在每个节点，以便执行诸如 mount 之类的指令。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410191155792.png)

### Kubernetes CSI Sidecar Containers 是什么？

CSI sidecar containers 由 Kubernetes 社区维护，与第三方的 CSI driver container 一起部署在同一个 Pod 中。CSI sidecar containers 会与 CSI driver container（Controller Server, Node Server） 一起部署在同一个 Pod 中，用于实现 CSI 插件的注册和管理。CSI sidecar containers 会根据需求通过 gRPC 调用 CSI driver container 中相应的方法来实现 volume 的创建、删除、挂载、卸载等操作。有 5 个比较重要的调用方法：

- CreateVolume：创建底层存储 Volume，例如在云厂商上创建相应的云硬盘。
- DeleteVolume：删除 Volume。
- ControllerPublishVolume（可选）: 卷创建好后，发布到某个节点（好比云硬盘购买后，需要挂到节点里，才能看到）
- NodeStageVolume（可选）：将云硬盘格式化成对应文件系统，并且挂载到一个全局目录上（方便多 Pod 使用同一个卷，只需格式化一次）
- NodePublishVolume：把宿主机目录（或全局目录）挂载到 Pod 里。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410191150140.png)

Kubernetes 社区提供了以下几种主要的 CSI sidecar containers，我们可以根据需要选择使用：
- node-driver-registrar：可从 CSI driver 获取驱动程序信息（通过 NodeGetInfo 方法），并使用 kubelet 插件注册机制在该节点上的 kubelet 中对其进行注册。
- external-provisioner：它监听 PersistentVolumeClaim 创建，调用 CSI 驱动的 CreateVolume 方法创建对应的底层存储，一旦创建成功，provisioner 会创建一个 PersistentVolume 资源。当监听到 PersistentVolumeClaim 删除时，它会调用 CSI 的 DeleteVolume 方法删除底层存储，如果成功，则删除 PersistentVolume。
- livenessprobe：监视 CSI 驱动程序的运行状况，并将其报告给 Kubernetes。这使得 Kubernetes 能够自动检测驱动程序的问题，并重新启动 pod 来尝试修复问题。
- external-attacher：用于监听 Kubernetes VolumeAttachment 对象并触发 CSI 的 `Controller[Publish|Unpublish]Volume` 操作。
- external-resizer：监听 PersistentVolumeClaim 资源修改，调用 CSI ControllerExpandVolume 方法，来调整 volume 的大小。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410191153107.png)

对于文件存储（如 NFS）来说，由于不需要 attach 的操作，因此可以把 external-attacher，也就不会创建 VolumeAttachment 对象了。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410191156404.png)

参考资料：

- [kubernetes/k8s CSI分析-容器存储接口分析](https://www.cnblogs.com/lianngkyle/p/15055552.html)
- [从零开始入门 K8s | Kubernetes 存储架构及插件使用](https://cloudpods.csdn.net/657806efb8e5f01e1e4477ea.html#devmenu10)
- [How the CSI (Container Storage Interface) Works](https://sklar.rocks/how-container-storage-interface-works/)

### Pod 挂载 volume 的过程

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410191158436.png)

### 删除 VolumeAttachment 后，会立即执行卸载 volume 的操作吗？

当删除 VolumeAttachment 后，如果 Pod 仍然在使用 volume，volume 不会被立即卸载，并且 Ad Controller 会重新创建 VolumeAttachment。

当用户删除 Pod 时，Kubelet 会调用 NodeUnpublishVolume 方法来在 Pod 中 umount volume，然后删除 Pod。

之后 Ad Controller 会删除 VolumeAttachment，external-attacher 会 watch VolumeAttachment 对象，当 VolumeAttachment 被删除时，会调用 CSI 的 ControllerUnpublishVolume 方法来卸载 volume，此时在节点上的 mount 信息就看不到这个 volume 了。
