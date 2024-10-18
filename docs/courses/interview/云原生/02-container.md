---
title: 容器
author: Se7en
categories:
  - Interview
tags:
  - Container
---

## 容器 CPU 和内存限制在 cgroup 中的实现

在 Pod Spec 里的设置的 CPU 和内存限制，实际上是通过 cgroup 实现的。cgroup 是 Linux 内核提供的一种机制，用于限制、记录和隔离一组进程的资源使用。cgroup 通过文件系统的方式将一组进程组织在一起，并为这组进程分配资源。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: frontend
spec:
  containers:
  - name: app
    image: images.my-company.example/app:v4
    env:
    resources:
      requests:
        memory: "64Mi"
        cpu: "1"
      limits:
        memory: "128Mi"
        cpu: "2"
```
**CPU**
- **CPU requests 经过转换之后会写入 cpu.share**，表示这个 Cgroup 最少需要使用的 CPU。cpu.shares 这个值决定了 CPU Cgroup 子系统下控制组可用 CPU 的相对比例，不过只有当系统上 CPU 完全被占满的时候，这个比例才会在各个控制组间起作用。
- **CPU limits 经过转换之后会写入 cpu.cfs_quota_us**，表示这个 Cgroup 最多可以使用的 CPU；cpu.cfs_quota_us（一个调度周期内这个控制组被允许运行的时间） 和 cpu.cfs_period_us（CFS 算法的调度周期，一般是 100000）这两个值决定了每个控制组中所有进程的可使用 CPU 资源的最大值。例如，如果 cpu.cfs_quota_us 设置为 50000，cpu.cfs_period_us 设置为 100000，那么这个控制组中的所有进程在一个调度周期内最多只能运行 50% 的 CPU 时间。

**内存**
- cgroup 不能直接限制内存的最少使用量。
- **Memory limits 经过转换之后会写入 memory.limit_in_bytes**， 表示这个 cgroup 最多可以使用的内存。

调度只看 requests： 如果一个 Node 的 Allocatable 剩余资源大于 Pod 的 requests ，就允许这个 pod 调度到这台 node 上。limits 是限额用的，确保资源不会用超，在调度时用不到。

## systemd 和 cgroupfs 驱动是什么？

kubelet 和底层容器运行时都需要对接 cgroup 来设置 Pod 和容器的 CPU、内存等资源的请求和限制。**若要对接 cgroup，kubelet 和容器运行时（如 containerd, CRI-O）需要使用同一个 cgroup 驱动。**

kubelet 和容器运行时需使用相同的 cgroup 驱动并且采用相同的配置。同时存在两个 cgroup 管理器将造成系统中针对可用的资源和使用中的资源出现两个视图。某些情况下， 将 kubelet 和容器运行时配置为使用 cgroupfs、但为剩余的进程使用 systemd 的那些节点将在资源压力增大时变得不稳定。

- **当使用 cgroupfs 驱动时， kubelet 和容器运行时将直接对接 cgroup 文件系统来配置 cgroup。**
- 使用 systemd cgroup 驱动时，所有 cgroup-writing 操作都必须通过 systemd 的接口，不能手动修改 cgroup 文件。当 systemd 是初始化系统时， 不推荐使用 cgroupfs 驱动，因为 systemd 期望系统上只有一个 cgroup 管理器。 此外，**如果你使用 cgroup v2，则应用 systemd cgroup 驱动取代 cgroupfs。** 从 v1.22 开始，在使用 kubeadm 创建集群时，如果用户没有在 KubeletConfiguration 下设置 cgroupDriver 字段，kubeadm 默认使用 systemd。

要将 systemd 设置为 cgroup 驱动，需编辑 KubeletConfiguration 的 cgroupDriver 选项，并将其设置为 systemd。例如：

```yaml
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
...
cgroupDriver: systemd
```

在 containerd 中，可以通过配置文件 /etc/containerd/config.toml 来设置使用 systemd cgroup 驱动。例如：

```toml
[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
  ...
  [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
    SystemdCgroup = true
```

参考资料
- [Kubernetes 官方文档：容器运行时](https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/)

## kubelet 的 cgroup 层级有哪些？

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410182222368.png)

- **Node 级别**：针对 SystemReserved、KubeReserved 和 kubepods 分别创建的三个 cgroup；cgroup v1 是按 resource controller 类型来组织目录的， 因此，/kubepods 会按 resource controller 对应到 /sys/fs/cgroup/{resource controller}/kubepods/，例如：
  - `/sys/fs/cgroup/cpu/kubepods/`
  - `/sys/fs/cgroup/memory/kubepods/`
- **QoS 级别**：在 kubepods cgroup 里面，又针对三种 pod QoS 分别创建一个 sub-cgroup：
  - Burstable： 默认 `/sys/fs/cgroup/{controller}/kubepods/burstable/`；
  - BestEffort： 默认 `/sys/fs/cgroup/{controller}/kubepods/besteffort/`；
  - Guaranteed：这个比较特殊，直接就是 `/sys/fs/cgroup/{controller}/kubepods/`，没有单独的子目录。这是因为这种类型的 pod 都设置了 limits， 就无需再引入一层 wrapper 来防止这种类型的 pods 的资源使用总量超出限额。
- **Pod 级别**：每个 pod 创建一个 cgroup，用来限制这个 pod 使用的总资源量；
- **Container** 级别：在 pod cgroup 内部，限制单个 container 的资源使用量。

参考资料：
- [k8s 基于 cgroup 的资源限额（capacity enforcement）：模型设计与代码实现（2023）](https://arthurchiao.art/blog/k8s-cgroup-zh/)

## Pod 中有多个容器时，Pod 的 requests/limits 等于各个容器 requests/limits 之和吗？

并不是。这是因为：
- 某些资源是这个 Pod 的所有 container 共享的；
- 每个 pod 也有自己的一些开销，例如 sandbox container；
- Pod 级别还有一些内存等额外开销；

因此，为了防止一个 pod 的多个容器使用资源超标，k8s 引入了 pod-level cgroup，每个 pod 都有自己的 cgroup。

参考资料：
- [k8s 基于 cgroup 的资源限额（capacity enforcement）：模型设计与代码实现（2023）](https://arthurchiao.art/blog/k8s-cgroup-zh/)

## Kubernetes Pod 的 Qos 类型有哪几种？

- **Guaranteed**: requests == limits, requests != 0， 即 正常需求 == 最大需求，换言之 spec 要求的资源量必须得到保证，少一点都不行；
- **Burstable**: requests < limits, requests != 0， 即 正常需求 < 最大需求，资源使用量可以有一定弹性空间；
- **BestEffort**: request == limits == 0， 创建 pod 时不指定 requests/limits 就等同于设置为 0，kubelet 对这种 pod 将尽力而为；