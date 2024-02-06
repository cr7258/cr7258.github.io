---
title: 使用 Kubectl Patch 命令更新资源
author: Se7en
date: 2023/07/01 22:00
categories:
 - 原创
tags:
 - Kubernetes
 - Kubectl
---

# 使用 Kubectl Patch 命令更新资源

Kubectl patch 命令允许用户对运行在 Kubernetes 集群中的资源进行局部更新。相较于我们经常使用的 kubectl apply 命令，kubectl patch 命令在更新时无需提供完整的资源文件，只需要提供要更新的内容即可。

Kubectl patch 支持以下 3 种 patch 类型：
- **strategic patch**（默认）：根据不同字段 patchStrategy 决定具体的合并 patch 策略。 Strategic merge patch 并非通用的 RFC 标准，而是 Kubernetes 特有的一种更新 Kubernetes 资源对象的方式。与 JSON merge patch 和 JSON patch 相比，strategic merge patch 更为强大。
- **JSON merge patch**：遵循 [JSON Merge Patch, RFC 7386[1]](https://tools.ietf.org/html/rfc7386) 规范，根据 patch 中提供的期望更改的字段及其对应的值，更新到目标中。
- **JSON patch**：遵循 [JSON Patch, RFC 6902[2]](https://tools.ietf.org/html/rfc6902) 规范，通过明确的指令表示具体的操作。

接下来对 Kubectl patch 的 3 种类型进行介绍。

## 1 使用 strategic merge patch 更新资源

下面是具有 2 个副本的 Deployment 的配置文件。

```yaml
# deployment-patch.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: patch-demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: patch-demo-ctr
        image: nginx
      tolerations:
      - effect: NoSchedule
        key: dedicated
        value: test-team
```

创建 Deployment。

```bash
kubectl apply -f deployment-patch.yaml
```

此时，每个 Pod 都有一个运行 nginx 镜像的容器。

```bash
> kubectl get pod -l app=nginx
NAME                          READY   STATUS    RESTARTS   AGE
patch-demo-54975b655f-csk9g   1/1     Running   0          50s
patch-demo-54975b655f-qvv59   1/1     Running   0          50s
```

现在假设你希望每个 Pod 有两个容器：一个运行 nginx，另一个运行 redis。可以执行以下命令更新，不通过 `--type` 参数指定 patch 类型时，默认使用 strategic 策略进行更新。

```bash
kubectl patch deployment patch-demo --patch '
{
  "spec": {
    "template": {
      "spec": {
        "containers": [
          {
            "name": "patch-demo-ctr-2",
            "image": "redis"
          }
        ]
      }
    }
  }
}'
```

除了通过 `--patch(-p)` 参数在命令中指定更新的 JSON 内容，也可以使用 `--patch-file` 参数指定更新的 patch 文件。创建一个名为 patch-file.yaml 的文件，内容如下：

```yaml
# patch/strategic-patch-file.yaml
spec:
  template:
    spec:
      containers:
      - name: patch-demo-ctr-2
        image: redis
```

然后执行以下命令更新。

```bash
kubectl patch deployment patch-demo --patch-file patch-file.yaml
```

查看 patch-demo Deployment，输出显示 Pod 有两个容器：一个运行 nginx，一个运行 redis。

```bash
kubectl get deployment patch-demo -o yaml
```

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230423150222.png)

前面提到默认的 strategic patch 类型是根据不同字段 `patchStrategy` 决定具体的合并 patch 策略。patch 策略由 Kubernetes 源代码中字段标记中的 `patchStrategy` 键的值指定。`patchStrategy` 总共有以下 3 种：
- 1.**replace（默认）**: 如果 list 类型字段未设置 `patchStrategy`，则整个 list 会被替换掉。
- 2.**merge**: 将 patch 的 list 中的元素合并到原 list 中。
- 3.**retainKeys**：仅保留 object 对象中指定的字段。

例如，[PodSpec 结构体[3]](https://github.com/kubernetes/api/blob/release-1.27/core/v1/types.go?spm=a2c6h.12873639.article-detail.8.d1813dd5gESTff) 的 Containers 字段的 `patchStrategy` 为 **merge**：

```go
```go
type PodSpec struct {
  ...
  Containers []Container `json:"containers" patchStrategy:"merge" patchMergeKey:"name" protobuf:"bytes,2,rep,name=containers"`
  ...
}
```

你可以在 [Kubernetes API 文档[4]](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.27/#podspec-v1-core) 中看到字段的 patch 策略。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230423120445.png)

可以看到其中有两个关键信息：`patchStrategy:"merge" patchMergeKey:"name"` 。这就代表了，containers 列表使用 strategic merge patch 策略更新时，会把下面每个元素中的 name 字段看作 key。

简单来说，在我们 patch 更新 containers 不再需要指定下标序号了，而是指定 name 来修改，Kubernetes 会把 name 作为 key 来计算合并。如果 K8s 发现当前 containers 中已经有名字为 nginx 的容器，则只会把 image 更新上去；而如果当前 containers 中没有 nginx 容器，K8s 会把这个容器插入 containers 列表。

从 Kubernetes API 文档中可以看到 PodSpec 的 Tolerations 字段在其字段标签中没有键 `patchStrategy`，因此 patch 合并策略使用默认的 patch 策略，即 `replace`，也就是说当更新 Tolerations 字段时，整个 list 会被替换。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230423121830.png)

接下来我们尝试更新 Tolerations 字段的内容。

```yaml
kubectl patch deployment patch-demo --patch '
{
  "spec": {
    "template": {
      "spec": {
        "tolerations": [
          {
            "effect": "NoSchedule",
            "key": "disktype",
            "value": "ssd"
          }
        ]
      }
    }
  }
}'
```

查看 patch 后的 Deployment 资源发现 PodSpec 中只有一个 Toleration，也就是说 Toleration 中原来的内容被覆盖了。

```yaml
kubectl get deployment patch-demo -o yaml
```

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230423150322.png)


Deployment strategy 用于定义在升级应用时对 Pod 进行替换的策略，其中有 2 种 策略：
- 1.**RollingUpdate**（默认）：滚动更新，用新版本的 Pod 逐步替代旧版本的 Pod。
- 2.**Recreate**：先删除所有的旧 Pod，然后创建新 Pod。

我们之前创建的 patch-demo Deployment 使用的是默认的 RollingUpdate 策略。

```bash
kubectl get deployment patch-demo -o yaml
```

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230423150409.png)

如果我们尝试使用 patch 命令将 Deployment strategy 更新为 Recreate ：

```yaml
kubectl patch deployment patch-demo --patch '
{
  "spec": {
    "strategy": {
      "type": "Recreate"
    }
  }
}'
```

会看到以下报错：

```bash
The Deployment "patch-demo" is invalid: spec.strategy.rollingUpdate: Forbidden: may not be specified when strategy `type` is 'Recreate'
```

这是由于 `spec.strategy.rollingUpdate` 字段中已经定义了 rollingUpdate 类型更新策略相关的配置参数，然而 Recreate 类型的策略是不存在这些配置参数的。我们需要再更新 ``spec.strategy.type` 为 Recreate 的同时，移除 `spec.strategy.rollingUpdate`。

查看 Kubernetes API 文档可以发现 Deployment strategy 的 patch 策略为`retainKeys`，我们可以在 `spec.strategy` 字段下配置 `$retainKeys` 需要保留的字段 type，未列出的字段 `rollingUpdate` 将会被移除。


![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230423144441.png)

使用新的 patch 命令更新 Deployment。

```yaml
kubectl patch deployment patch-demo --patch '
{
  "spec": {
    "strategy": {
      "$retainKeys": [
        "type"
      ],
      "type": "Recreate"
    }
  }
}'
```

检查 Deployment 的内容。

```bash
kubectl get deployment patch-demo -o yaml
```

输出显示 Deployment 中的 `strategy` 对象不再包含 `rollingUpdate` 键。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230423151152.png)

## 2 使用 JSON merge patch 更新资源

**JSON merge patch** 遵循 [JSON Merge Patch, RFC 7386](https://tools.ietf.org/html/rfc7386) 规范，根据 patch 中提供的期望更改的字段及其对应的值，更新到目标中。具体规则如下：
- 1.如果提供的 patch 内容中包含目标中不存在的字段，则添加该字段。
- 2.如果目标包含 patch 中提供的字段，则替换该字段的值。
- 3.如果 patch 中将目标中含有的字段设置为 null，则删除该字段。

让我们看一个例子，源文件如下：

```yaml
{
  "title": "Goodbye!",
  "author": {
    "givenName": "John",
    "familyName": "Doe"
  },
  "tags": [
    "example",
    "sample"
  ],
  "content": "This will be unchanged"
}
```

如果我们的 patch 内容如下，JSON merge patch 将会对源文件进行以下更改：
- 1.修改 `title` 字段的值。
- 2.删除 `author.familyName` 字段。
- 3.添加 `phoneNumber` 字段。
- 4.删除 `tags` 列表中的 example。

```yaml
{
  "title": "Hello!",
  "author": {
    "familyName": null
  },
  "phoneNumber": "+01-123-456-7890",
  "tags": [
    "example"
  ]
}
```

那么最终的文件将会变成：

```yaml
{
  "title": "Hello!",
  "author": {
    "givenName": "John"
  },
  "tags": [
    "example"
  ],
  "content": "This will be unchanged",
  "phoneNumber": "+01-123-456-7890"
}
```

我们使用 kubectl patch 时，只需要在 `--type` 参数设置 `merge` 就可以通过 JSON merge patch 的方式更新资源了。JSON merge patch 同样支持指定文件的方式更新 patch。例如执行以下命令分别更新 patch-demo Deployment 的 replicas 副本数以及 containers 容器列表。

```yaml
kubectl patch deployment --type merge patch-demo --patch '
{
  "spec": {
    "replicas": 5
  }
}'

kubectl patch deployment --type merge patch-demo --patch '
{
  "spec": {
    "template": {
      "spec": {
        "containers": [
          {
            "name": "patch-demo-ctr-3",
            "image": "nginx"
          }
        ]
      }
    }
  }
}'
```

查看更新后的 Deployment 资源。

```bash
kubectl get deployment patch-demo -o yaml
```

可以看到 replicas 字段被改为了 5，而 containers 列表被完全替换成新的了。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230423154616.png)

JSON merge patch 无法单独更新一个列表中的某个元素，因此不管我们是要在 containers 里新增容器、还是修改已有容器的 image、env 等字段，都要用整个 containers 列表来提交 patch。

```yaml
kubectl patch deployment --type merge patch-demo --patch '
{
  "spec": {
    "template": {
      "spec": {
        "containers": [
          {
            "name": "patch-demo-ctr-1",
            "image": "nginx"
          },
          {
            "name": "patch-demo-ctr-2",
            "image": "redis"
          },
          {
            "name": "patch-demo-ctr-3",
            "image": "nginx"
          }
        ]
      }
    }
  }
}'
```

查看更新后的 Deployment 资源。

```bash
kubectl get deployment patch-demo -o yaml
```

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230423155058.png)

##  3 使用 JSON patch 更新资源

**JSON patch** 遵循 [JSON Patch, RFC 6902](https://tools.ietf.org/html/rfc6902) 规范，通过明确的指令表示具体的操作，指令在 op 字段中设置，包含：
- 1.**add**：添加字段。
- 2.**remove**：删除字段。
- 3.**replace**：替换字段。
- 4.**move**：删除指定字段的值，并将其添加到目标字段。
- 5.**copy**：将指定字段的值复制到目标字段。
- 6.**test**：测试字段的值是否等于给定值。

还是用上面相同的例子对比使用 JSON patch，源文件如下：

```yaml
{
  "title": "Goodbye!",
  "author": {
    "givenName": "John",
    "familyName": "Doe"
  },
  "tags": [
    "example",
    "sample"
  ],
  "content": "This will be unchanged"
}
```

JSON patch 的内容如下，和前面 JSON merge patch 实现的效果一样，将会对源文件进行以下更改：
- 1.修改 `title` 字段的值。
- 2.删除 `author.familyName` 字段。
- 3.添加 `phoneNumber` 字段。
- 4.删除 `tags` 列表中的 example。

```yaml
[  
{ "op": "replace", "path": "/title", "value": "Hello!"},  
{ "op": "remove", "path": "/author/familyName"},  
{ "op": "add", "path": "/phoneNumber", "value": "+01-123-456-7890"},  
{ "op": "replace", "path": "/tags", "value": ["example"]}  
]
```

为了方便对比我把前面 JSON merge patch 的内容也放在这里。

```yaml
{
  "title": "Hello!",
  "author": {
    "familyName": null
  },
  "phoneNumber": "+01-123-456-7890",
  "tags": [
    "example"
  ]
}
```

可以看出 JSON merge patch 和 JSON patch 相比，最大的优势就是简单，但这种简单性同样带来了一些限制：
- 1.无法将字段的值设置为 null，因为在 JSON merge patch 中通过将字段值设置为 null 来删除该字段。
- 2.patch 不能直接操作数组。如果你想向数组添加一个元素，或改变其中的任何元素，那么必须将整个数组包含在 patch 内容中，即使实际更改的部分很少。
- 3.执行永远不会出错，任何错误的 patch 都会被合并。因此它是一种非常自由的格式。它不一定好，因为你可能需要在合并后执行编程检查，或者在合并后运行 JSON 模式验证。

JSON Merge Patch 是一种简单的格式，它的应用范围相对有限。当你只需要更新非常简单的 JSON Schema 时，使用 JSON Merge Patch 可能是一个不错的选择。然而，对于更复杂的用例，我会选择使用 JSON Patch，因为它适用于任何 JSON 文档，并且该规范还确保原子执行和可靠的错误报告。

我们使用 kubectl patch 时，只需要在 `--type` 参数设置 `json` 就可以通过 JSON patch 的方式更新资源了。JSON patch 同样支持指定文件的方式更新 patch。例如执行以下命令分别更新 patch-demo Deployment 的 replicas 副本数以及 containers 容器列表。

```yaml
kubectl patch deployment --type json patch-demo --patch '
[
  {
    "op": "replace",
    "path": "/spec/replicas",
    "value": 2
  }
]'

kubectl patch deployment --type json patch-demo --patch '
[
  {
    "op": "add",
    "path": "/spec/template/spec/containers/3",
    "value": {
      "name": "patch-demo-ctr-4",
      "image": "redis"
    }
  }
]'
```

查看更新后的 Deployment 资源。

```bash
kubectl get deployment patch-demo -o yaml
```

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230423162531.png)


## 4 总结

本文介绍了使用 kubectl patch 命令更新 Kubernetes 集群中资源对象的方法。Kubectl patch 命令允许用户对资源对象的指定字段进行局部更新，提高了更新操作的灵活性。文章介绍了 kubectl patch 命令的语法和使用方法，包括三种 strategic patch, JSON merge patch, JSON patch 3 种类型，并结合了具体的示例进行说明。

## 5 参考资料
- [1] JSON Merge Patch, RFC 7386: https://tools.ietf.org/html/rfc7386
- [2] JSON Patch, RFC 6902: https://tools.ietf.org/html/rfc6902
- [3] PodSpec 结构体: https://github.com/kubernetes/api/blob/release-1.27/core/v1/types.go?spm=a2c6h.12873639.article-detail.8.d1813dd5gESTff
- [4] Kubernetes API 文档: https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.27/#podspec-v1-core)
- [5] Kubernetes Apply vs. Replace vs. Patch: https://blog.atomist.com/kubernetes-apply-replace-patch/
- [6] 理解 K8s 中的 Client-Side Apply 和 Server-Side Apply: https://mp.weixin.qq.com/s/EYtMO9KGRK_lHS2IW-mZug
- [7] JSON Patch and JSON Merge Patch: https://erosb.github.io/post/json-patch-vs-merge-patch/?ref=airplane.ghost.io
- [8] How to use Kubectl Patch: https://www.airplane.dev/blog/kubectl-patch
- [9] Break Down Kubernetes Server-Side Apply: https://medium.com/swlh/break-down-kubernetes-server-side-apply-5d59f6a14e26
- [10] Kubernetes中的JSON patch: https://juejin.cn/post/6993618347904466957
- [11] Kubectl Patch: What You Can Use It for and How to Do It: https://loft.sh/blog/kubectl-patch-what-you-can-use-it-for-and-how-to-do-it/#strategic-patch
- [12] 你不了解的K8s资源更新机制，从一个OpenKruise用户疑问开始: https://developer.aliyun.com/article/763212#slide-2
- [13] kubernetes update跟patch区别: https://fafucoder.github.io/2020/09/09/kubernetes-update-patch/

## 6 欢迎关注

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220104221116.png)
