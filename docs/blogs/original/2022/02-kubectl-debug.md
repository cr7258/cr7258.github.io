---
title: Kubectl debug 调试容器
author: Se7en
date: 2022/09/01 21:00
categories:
 - 原创
tags:
 - Kubernetes
 - Kubectl
---

# Kubectl debug 调试容器

调试容器化工作负载和 Pod 是每位使用 Kubernetes 的开发人员和 DevOps 工程师的日常任务。通常情况下，我们简单地使用 kubectl logs 或者 kubectl describe pod 便足以找到问题所在，但有时候，一些问题会特别难查。这种情况下，大家可能会尝试使用 kubectl exec，但有时候这样也还不行，因为 Distroless 等容器甚至不允许通过 SSH 进入 shell。那么，如果以上所有方法都失败了，我们要怎么办？

Kubernetes v1.18 版本新增的 kubectl debug 命令，允许调试正在运行的 pod。它会将名为 EphemeralContainer（临时容器）的特殊容器注入到问题 Pod 中，让我们查看并排除故障。

临时容器其实是 Pod 中的子资源，类似普通 container。但与普通容器不同的是，临时容器不用于构建应用程序，而是用于检查。 我们不会在创建 Pod 时定义它们，而使用特殊的 API 将其注入到运的行 Pod 中，来运行命令并检查 Pod 环境。除了这些不同，临时容器还缺少一些基本容器的字段，例如 ports、resources。

## 开启临时容器功能

虽然临时容器是作为 Kubernetes 核心的 Pod 规范的一部分，但很多人可能还没有听说过。这是因为临时容器处于早期 Alpha 阶段，这意味着默认情况下不启用。Alpha 阶段的资源和功能可能会出现重大变化，或者在 Kubernetes 的某个未来版本中被完全删除。因此，要使用它们必须在 kubelet 中使用 Feature Gate（特性门控）显式启用。

### 在已经运行的 Kubernetes 集群中开启临时容器功能

编辑 /etc/manifests/kube-apiserver.yaml 文件，添加 `EphemeralContainers=true` 开启临时容器功能，如果要开启多个特性门控功能用 `,` 隔开：

```sh
- --feature-gates=DynamicKubeletConfig=true,EphemeralContainers=true
```

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210629221036.png)

### 在初始化 Kubernetes 集群时开启临时容器功能

如果想在 kubeadm 初始化 Kubernetes 集群时开启临时容器功能，则修改 kubeadm 配置文件：

```yaml
# init-k8s.yaml 
apiVersion: kubeadm.k8s.io/v1beta2
kind: ClusterConfiguration
kubernetesVersion: v1.20.2
apiServer:
  extraArgs:
    feature-gates: EphemeralContainers=true
```
然后通过 kubeadm init 初始化 Kubernetes 集群：

```sh
kubeadm init --config init-k8s.yaml 
```

## 通过 Pod 副本调试

当故障容器不包括必要的调试工具甚至 shell 时，我们可以使用 `--copy-to` 指令复制出一个新的 Pod 副本，然后通过 `--share-processes` 指令使 [Pod 中的容器之间共享进程命名空间](https://kubernetes.io/zh/docs/tasks/configure-pod-container/share-process-namespace/)。进程共享的一个问题是它不能应用于现有的 Pod，因此我们必须创建一个新 Pod。

```sh
# 启动普通 Nginx Pod
> kubectl run nginx-app --image=nginx --restart=Never

# 启动临时容器，使用 Process Sharing（进程共享）来使用注入的临时容器检查 Pod 的原有容器。
# nginx-app 是普通 Pod 的名字，nginx-app-debug 是用于调试的 Pod 的名字，nginx-container-debug 是用于调试的 Pod 里的容器名，这里可以省略
> kubectl debug -it nginx-app \
--image=busybox --share-processes \
--copy-to=nginx-app-debug \
--container=nginx-container-debug

# 在临时容器可以看到 Nginx 容器的进程和文件
/ # ps ax
PID   USER     TIME  COMMAND
    1 root      0:00 /pause
    6 root      0:00 nginx: master process nginx -g daemon off;
   35 101       0:00 nginx: worker process
   36 101       0:00 nginx: worker process
   37 101       0:00 nginx: worker process
   38 101       0:00 nginx: worker process
   39 101       0:00 nginx: worker process
   40 101       0:00 nginx: worker process
   41 101       0:00 nginx: worker process
   42 101       0:00 nginx: worker process
   43 root      0:00 sh
   48 root      0:00 ps ax
/ # cat /proc/6/root/etc/nginx/conf.d/default.conf
server {
    listen       80;
    listen  [::]:80;
    server_name  localhost;

    #access_log  /var/log/nginx/host.access.log  main;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }
......
```

上面的代码表明，通过进程共享，我们可以看到 Pod 中另一个容器内的所有内容，包括其进程和文件，这对于调试来说非常方便。如果我们从另一个终端列出正在运行的 Pod，我们将看到以下内容：

```sh
❯ kubectl get pod
NAME                           READY   STATUS    RESTARTS   AGE
nginx-app                       1/1     Running   0          3m23s
nginx-app-debug                 2/2     Running   0          3m10s
```

这就是我们在原始应用程序 Pod 上的新调试 Pod。与原始容器相比，它有 2 个容器，因为它还包括临时容器。此外，如果想在任何时候验证 Pod 中是否允许进程共享，那么可以运行：

```sh
❯ kubectl get pod some-app-debug -o json  | jq .spec.shareProcessNamespace
true
```

## 在创建 Pod 副本时改变 Pod 运行的命令

有时更改容器的命令很有用，例如调试崩溃的容器。为了模拟应用崩溃的场景，使用 kubectl run 命令创建一个立即退出的容器：


```sh
kubectl run --image=busybox myapp -- false
```

使用 kubectl describe pod myapp 命令，可以看到容器崩溃了：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210629222444.png)

此时可以使用 kubectl debug 命令创建该 Pod 的一个副本， 在该副本中将命令改变为交互式 shell：

```sh
# 这里 --container 不能省略
❯ kubectl debug myapp -it --copy-to=myapp-debug --container=myapp -- sh
If you don't see a command prompt, try pressing enter.
/ #
```

现在就有了一个可以执行类似检查文件系统路径或者手动运行容器命令的交互式 shell。

## 创建 Pod 副本时更改容器镜像

在某些情况下，你可能想从正常生产容器镜像中把行为异常的 Pod 改变为包含调试版本或者附加应用的镜像。

下面的例子，用 kubectl run 创建一个 Pod：

```sh
kubectl run myapp --image=busybox --restart=Never -- sleep 1d
```

现在可以使用 kubectl debug 创建一个副本 并改变容器镜像为 ubuntu：

```sh
kubectl debug myapp --copy-to=myapp-debug --set-image=myapp=ubuntu
```
--set-image=myapp=ubuntu 指令中 myapp 是容器名，ubuntu 是新的容器镜像。

## 调试集群节点

kubectl debug 允许通过创建 Pod 来调试节点，该 Pod 将在指定节点上运行，节点的根文件系统安装在 /root 目录中。我们甚至可以用 chroot 访问主机二进制文件，这本质上充当了节点的 SSH 连接：

查看 Kubernetes 集群的节点，我们准备调试 k8s-calico-master 节点。

```sh
❯ kubectl get nodes
NAME                STATUS   ROLES    AGE   VERSION
k8s-calico-master   Ready    master   7d    v1.17.3
k8s-calico-node01   Ready    <none>   7d    v1.17.3
k8s-calico-node02   Ready    <none>   7d    v1.17.3
```

使用 node/... 作为参数显式运行 kubectl debug 以访问我们集群的节点。

```sh
❯ kubectl debug node/k8s-calico-master  -it --image=ubuntu
```

当连接到Pod后，使用 chroot /host 突破 chroot，并完全进入主机。可以获取到节点完全的权限，查看到节点所有的文件，甚至重启节点。

```sh
root@k8s-calico-master:/etc# chroot /host

# 查看节点文件
sh-4.2# cd /etc/kubernetes/manifests/
sh-4.2# ls
etcd.yaml  kube-apiserver.yaml	kube-controller-manager.yaml  kube-scheduler.yaml
```
## 参考链接
* https://mp.weixin.qq.com/s/uZZvsqDuqM36HB5lVyO9iA
* https://kubernetes.io/zh/docs/reference/command-line-tools-reference/feature-gates/
* https://kubernetes.io/zh/docs/concepts/workloads/pods/ephemeral-containers/
* https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.21/#ephemeralcontainer-v1-core
* https://kubernetes.io/zh/docs/tasks/configure-pod-container/share-process-namespace/
