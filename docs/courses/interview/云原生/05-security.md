---
title: 安全
author: Se7en
categories:
  - Interview
tags:
  - Security
---

## 在 Kubernetes 中容器内的 root 用户是宿主机的 root 用户吗？

默认情况下是的。在不使用 user namespace 的情况下，对于以 root 用户运行的容器而言，发生容器逃逸（如 [CVE-2024-21626](https://www.youtube.com/watch?v=07y5bl5UDdA&ab_channel=Kinvolk)）时，容器将拥有在宿主机上的 root 特权。可以通过设置 `hostUsers: false` 来为 Pod 启用 user namespace。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: userns
spec:
  hostUsers: false
  containers:
  - name: shell
    command: ["sleep", "infinity"]
    image: debian
```

参考资料：

- [为 Pod 配置 user 名字空间](https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/user-namespaces/)
- [Kubernetes 1.30：对 Pod 使用用户命名空间的支持进阶至 Beta](https://kubernetes.io/zh-cn/blog/2024/04/22/userns-beta/)
- [极客时间；19 | 容器安全（1）：我的容器真的需要privileged权限吗?](https://time.geekbang.org/column/article/326253)
