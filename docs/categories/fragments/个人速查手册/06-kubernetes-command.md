---
title: Kubernetes 常用命令
author: Se7en
date: 2025/03/25 16:00
categories:
 - 个人速查手册
tags:
 - Kubernetes
---

# Kubernetes 常用命令

## 找出 DaemonSet 在哪些 node 上没有成功创建 Pod

```bash
export DAEMONSET_NAME="kube-proxy-cpu-worker-b-v1.30.8"
kubectl get nodes | egrep -v $(kubectl get pods -o wide | grep $DAEMONSET_NAME | awk '{print $7}' | grep -v none | paste -s -d"|" -)

```

命令拆解：

1. `kubectl get pods -o wide`：列出所有 pod，包括所在 Node 信息。

输出可能像这样：

```bash
NAME                         READY   STATUS    RESTARTS   AGE   IP            NODE
kube-proxy-xxxx              1/1     Running   0          3d    10.0.0.1      ip-192-168-1-1
...
```

2. `grep $DAEMONSET_NAME`：只保留和该 DaemonSet 相关的 Pod 行。

3. `awk '{print $7}'`：提取 Pod 所在的 Node 名字（第 7 列是 NODE）。

4. `grep -v none`：排除没有调度成功的 Pod（有时 NODE 显示为 none）。

5. `paste -s -d"|" -`：把所有 Node 名用 `|（正则或）`拼起来，例如：

```bash
ip-192-168-1-1|ip-192-168-1-2|ip-192-168-1-3
```

6. `kubectl get nodes`：列出所有 Node。

7. `egrep -v <上面拼出来的正则>`：反向匹配，显示那些没有出现在上述 Node 列表中的 Node，也就是没有运行该 DaemonSet Pod 的 Node。

## 命令补全

```bash
echo "source <(kubectl completion bash)" >> ~/.bashrc
```
