---
title: ArgoCD 简明教程
author: Se7en
date: 2023/11/01 22:36
categories:
 - 原创
tags:
 - ArgoCD
 - DevOps
---

# ArgoCD 简明教程

## 1 Argo CD 简介
Argo CD 是一个为 Kubernetes 而生的，遵循声明式 GitOps 理念的持续部署（CD）工具，它的配置和使用非常简单，并且自带一个简单易用的 Dashboard 页面，并且支持多种配置管理/模板工具（例如 Kustomize、Helm、Ksonnet、Jsonnet、plain-YAML）。
Argo CD 被实现为一个 Kubernetes 控制器，它持续监控正在运行的应用程序并将当前的实时状态与所需的目标状态（例如 Git 仓库中的配置）进行比较，在 Git 仓库更改时自动同步和部署应用程序。

## 2 架构图

`Argo CD` 在 CI/CD 流程中的位置如下图所示，Argo CD 的主要职责是 CD（Continuous Delivery，持续交付），将应用部署到 Kubernetes 等环境中，而 CI（Continuous Integration，持续集成）主要是交给 Jenkins，Gitlab CI 等工具来完成。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211219161612.png)

这里简单介绍一下 `GitOps` 的概念，GitOps 这个词出现于 2017 年，是由 `Weaveworks` 公司根据多年云计算基础设施和应用程序管理经验而提出的一个概念，它是一种进行 Kubernetes 集群管理和应用程序交付的方式，GitOps 使用 Git 作为声明性基础设施和应用程序的单一事实来源。

GitOps 的核心思想是拥有一个 Git 仓库，包含目标环境中当前所需基础设施的**声明性**描述，以及使目标环境与 Git 仓库中描述的状态相匹配的自动化过程，Argo CD 就是一个遵循了 GitOps 理念的持续部署（CD）工具。

在 GitOps 模式的 CI/CD 流水线包含以下几个流程：
-   1.将应用的 Git 仓库分为 Application Deployment file 和 Docker file 两个库。 Docker file 用于存放应用的核心代码以及 Docker build file，后续将会直接打包成 Docker image；Application Deployment file 可以 Kustomize、Helm、Ksconnet、Jsonnet 等多种 Kubernetes 包管理工具来定义；以 Helm 为例，Chart 中所使用到的 Image 由 Docker file Code 打包完成后提供。
-   2.使用 Jenkins 或 Gitlab 等 CI 工具进行自动化构建打包，并将 Docker image push 到 Harbor 镜像仓库。
-   3.使用 Argo CD 部署应用。Argo CD 可以独立于集群之外，并且支持管理多个 Kubernetes 集群。在 Argo CD 上配置好应用部署的相关信息后 Argo CD 便可以正常工作，Argo CD 会自动和代码仓库 Application deployment file 的内容进行校验，当代码仓库中应用属性等信息发生变化时，Argo CD 会自动同步更新 Kubernetes 集群中的应用；应用启动时，会从 Harbor 镜像仓库拉取 Docker image。

本文主要介绍第 3 部分 Argo CD 部署应用，关于 GitOps 的完整实践后续会发文进行介绍。

## 3 快速开始
### 3.1 前提条件
- 1.准备好一套 Kubernetes 集群，参见 [使用 ezctl 工具部署和管理 Kubernetes 集群](https://mp.weixin.qq.com/s/8T1nc3N2f7TsZFErNZF2Wg)。
- 2.搭建好 Gitlab 代码仓库，参见 [Gitlab 安装指南](https://about.gitlab.cn/install/)。

### 3.2 安装 Argo CD
使用以下命令在 argocd 命名空间部署 Argo CD。
```bash
# 创建命名空间
kubectl create namespace argocd 
# 部署 argo cd
wget https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl apply -n argocd -f install.yaml
```

### 3.3 安装 Argo CD CLI
Argo CD CLI 是用于管理 Argo CD 的命令行工具，不同操作系统具体的安装方式可以参考 [Argo CD CLI Installation](https://argo-cd.readthedocs.io/en/stable/cli_installation/)

Mac 系统可以直接使用 brew install 进行安装。
```bash
brew install argocd
```

### 3.4 发布 Argo CD 服务
默认情况下， Argo CD 服务不对外暴露服务，可以通过 LoadBalancer 或者 NodePort 类型的 Service、Ingress、Kubectl 端口转发等方式将 Argo CD 服务发布到 Kubernetes 集群外部。

这里使用以下命令通过 NodePort 服务的方式暴露 Argo CD 到集群外部。
```bash
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'
```

现在我们已经将名字为 argocd-server 的 Service 改成 NodePort 类型了，可以在集群外部通过 <节点 IP>:<随机生成的 NodePort 端口> 来访问 Argo CD，我这里随机生成的 NodePort 端口是 32313。
```bash
$ kubectl get svc -n argocd 
NAME                    TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)                      AGE
argocd-dex-server       ClusterIP   10.68.51.140    <none>        5556/TCP,5557/TCP,5558/TCP   5m11s
argocd-metrics          ClusterIP   10.68.76.255    <none>        8082/TCP                     5m11s
argocd-redis            ClusterIP   10.68.223.131   <none>        6379/TCP                     5m11s
argocd-repo-server      ClusterIP   10.68.1.35      <none>        8081/TCP,8084/TCP            5m11s
argocd-server           NodePort    10.68.49.24     <none>        80:30582/TCP,443:32313/TCP   5m11s
argocd-server-metrics   ClusterIP   10.68.107.188   <none>        8083/TCP                     5m10s
```

浏览器输入 https://<节点 IP>:32313 访问 Argo CD。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211212173942.png)

### 3.5 获取 Argo CD 密码
默认情况下 `admin` 帐号的初始密码是自动生成的，会以明文的形式存储在 Argo CD 安装的命名空间中名为 `argocd-initial-admin-secret` 的 Secret 对象下的 `password` 字段下，我们可以用下面的命令来获取：
```bash
kubectl -n argocd get secret \
argocd-initial-admin-secret \
-o jsonpath="{.data.password}" | base64 -d

# 返回结果
kj8bDMiDTnsEfnjg
```

在浏览器输入密码登录 Argo CD。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211212174737.png)

登录后的界面如下所示。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211212174808.png)

命令行可以使用以下方式登录。
```bash
❯ argocd login <节点 IP>:32313
# 接收证书风险
WARNING: server certificate had error: x509: cannot validate certificate for 11.8.38.43 because it doesn't contain any IP SANs. Proceed insecurely (y/n)? y
Username:  # 输入用户名
Password: # 输入密码
'admin:login' logged in successfully
```

### 3.6 准备 Git 仓库
在 Gitlab 上创建项目，取名为 argocd-lab，为了方便实验将仓库设置为 public 公共仓库。在仓库中创建 quickstart 目录，在目录中创建两个 yaml 资源文件，分别是 myapp-deployment.yaml 和 myapp-service.yaml。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/Xnip2021-12-19_18-20-01.png)

yaml 资源文件内容如下：
```bash
# myapp-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - image: registry.cn-shanghai.aliyuncs.com/public-namespace/myapp:v1
        name: myapp
        ports:
        - containerPort: 80
 
# myapp-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  ports:
  - port: 80
    targetPort: 80
    nodePort: 32060
  type: NodePort
  selector:
    app: myapp
```
实验所需的镜像我已经在阿里云的镜像仓库中准备好了，大家可以直接使用。

### 3.7 创建 Argo CD App
首先创建一个命名空间 devops 用于 Argo CD 部署应用。
```bash
kubectl create ns devops
```
#### 3.7.1 方式一：使用 UI 创建 App
- Application Name: 自定义的应用名。
- Project: 使用默认创建好的 default 项目。
- SYNC POLICY： 同步方式，可以选择自动或者手动，这里我们选择手动同步。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211218192900.png)

- Repository URL: 项目的 Git 地址。
- Revision: 分支名。
- Path: yaml 资源文件所在的相对路径。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211218193803.png)

- Cluster URL: Kubernetes API Server 的访问地址，由于 Argo CD 和下发应用的 Kubernetes 集群是同一个，因此可以直接使用 https://kubernetes.default.svc 来访问。关于 Kubernetes 中 DNS 解析规则可以查看 [Pod 与 Service 的 DNS](https://kubernetes.io/zh/docs/concepts/services-networking/dns-pod-service/)。
- Namespace: 部署应用的命名空间。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211218193347.png)

创建完成后如下图所示，此时处于 OutOfSync 的状态：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211218193842.png)

由于我设置的是手动同步，因此需要点一下下面的 SYNC 进行同步。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211218193921.png)

在弹出框点击 SYNCHRONIZE，确认同步。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211218193945.png)

等待同步完成。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211218194139.png)

在 Argo CD 上点击应用进入查看详情。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211218194201.png)

在 Kubernetes 查看部署的资源。
```bash
root@cluster01-1:/root #kubectl get all -n devops 
NAME                         READY   STATUS    RESTARTS   AGE
pod/myapp-865f9f464f-qpjbc   1/1     Running   0          2m25s

NAME            TYPE       CLUSTER-IP   EXTERNAL-IP   PORT(S)        AGE
service/myapp   NodePort   10.68.93.5   <none>        80:32060/TCP   2m25s

NAME                    READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/myapp   1/1     1            1           2m25s

NAME                               DESIRED   CURRENT   READY   AGE
replicaset.apps/myapp-865f9f464f   1         1         1       2m25s
```

在集群外部通过 `<节点 IP>:<NodePort>` 端口访问 myapp 程序，可以看到此时是 v1 版本。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211218194557.png)

#### 3.7.2 方式二：使用 CLI 创建 APP
```bash
argocd app create myapp2 \
--repo http://11.8.36.29/root/argocd-lab.git \
--path quickstart --dest-server \
https://kubernetes.default.svc \
--dest-namespace devops
```

使用 argocd 命令查看创建的应用。
```bash
# 列出应用
❯ argocd app list
NAME   CLUSTER                         NAMESPACE  PROJECT  STATUS  HEALTH   SYNCPOLICY  CONDITIONS  REPO                                   PATH        TARGET
myapp  https://kubernetes.default.svc  devops     default  Synced  Healthy  <none>      <none>      http://11.8.36.29/root/argocd-lab.git  quickstart  main

# 查看 myapp 应用
❯ argocd app get myapp
Name:               myapp
Project:            default
Server:             https://kubernetes.default.svc
Namespace:          devops
URL:                https://11.8.36.159:32313/applications/myapp
Repo:               http://11.8.36.29/root/argocd-lab.git
Target:             main
Path:               quickstart
SyncWindow:         Sync Allowed
Sync Policy:        <none>
Sync Status:        Synced to main (82baed1)
Health Status:      Healthy

GROUP  KIND        NAMESPACE  NAME   STATUS  HEALTH   HOOK  MESSAGE
       Service     devops     myapp  Synced  Healthy        service/myapp created
apps   Deployment  devops     myapp  Synced  Healthy        deployment.apps/myapp created
```

#### 3.7.3 方式三：使用 YAML 文件创建
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
  namespace: argocd
spec:
  destination:
    namespace: devops # 部署应用的命名空间
    server: https://kubernetes.default.svc # API Server 地址
  project: default # 项目名
  source:
    path: quickstart # 资源文件路径
    repoURL: http://11.8.36.29/root/argocd-lab.git # Git 仓库地址
    targetRevision: main # 分支名
```

### 3.8 版本升级
这次我们将 myapp 应用从手动同步改成自动同步。点击 APP DETAILS -> SYNC POLICY，点击 ENABLE AUTO-SYNC。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211218195602.png)
编辑 myapp 资源文件，将版本从 v1 改为 v2，点击 Commit changes，提交更改。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211218195345.png)

等待一会 Argo CD 会自动更新应用，如果你等不及可以点击 Refresh，Argo CD 会去立即获取最新的资源文件。可以看到此时 myapp Deployment 会新创建 v2 版本的 Replicaset，v2 版本的 Replicaset 会创建并管理 v2 版本的 Pod。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211218200227.png)

在集群外部通过 `<节点 IP>:<NodePort>` 端口访问 myapp 程序，可以看到此时是 v2 版本。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211218201117.png)



### 3.9 版本回滚
细心的同学应该会发现升级到 v2 版本以后， v1 版本的 Replicaset 并没有被删除，而是继续保留，这是为了方便我们回滚应用。在 myapp 应用中点击 HISTORY AND ROLLBACK 查看历史记录，可以看到有 2 个历史记录。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211218200556.png)

假设我们刚刚上线的 v2 版本出现了问题，需要回滚回 v1 版本，那么我们可以选中 v1 版本，然后点击 Rollback 进行回滚。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211218200735.png)
在回滚的时候需要禁用 AUTO-SYNC 自动同步，点击 OK 确认即可。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211218200816.png)
等待一会可以看到此时已经回滚成功，此时 Pod 是 v1 版本的，并且由于此时线上的版本并不是 Git 仓库中最新的版本，因此此时同步状态是 OutOfSync。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211218200909.png)

## 4 参考资料
- [Argo CD 官方文档](https://argo-cd.readthedocs.io/en/stable/)
- [GitOps 持续部署工具 Argo CD 初体验](https://blog.csdn.net/weixin_40046357/article/details/118447858)
- [Argo CD 使用指南](https://kubeoperator.io/docs/user_manual/argocd/)
- [使用 GitLab CI 与 Argo CD 进行 GitOps 实践](https://cloud.tencent.com/developer/article/1664073?from=article.detail.1755628)
- [在K8S中使用Argo CD做持续部署](https://cloud.tencent.com/developer/article/1750692?from=article.detail.1664073)
- [Pod 与 Service 的 DNS](https://kubernetes.io/zh/docs/concepts/services-networking/dns-pod-service/)
- [2021年25佳DevOps工具, 你用了几个](https://www.kubernetes.org.cn/9538.html)
- [微服务 CI/CD 实践-GitOps 完整设计与实现](https://mp.weixin.qq.com/s/MN08YzdpDMYZ5xpQP1ECQQ)
- [FluxCD, ArgoCD or Jenkins X: Which Is the Right GitOps Tool for You?](https://blog.container-solutions.com/fluxcd-argocd-jenkins-x-gitops-tools)
- [CI/CD是什么？如何理解持续集成、持续交付和持续部署](https://www.redhat.com/zh/topics/devops/what-is-ci-cd)
- [当下最热门的 GitOps，你了解吗？](https://cloud.tencent.com/developer/article/1588400)
- [GitOps 应用实践系列 - 综述](https://segmentfault.com/a/1190000040831398)
