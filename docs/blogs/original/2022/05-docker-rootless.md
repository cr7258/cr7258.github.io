---
title: Docker Rootless 在非特权模式下运行 Docker
author: Se7en
date: 2022/03/03 20:00
categories:
 - 原创
tags:
 - Docker
---

# Docker Rootless 在非特权模式下运行 Docker

## Docker Rootless 基本概念
Rootless 模式允许以非 root 用户身份运行 **Docker 守护进程（dockerd）和容器**，以缓解 Docker 守护进程和容器运行时中潜在的漏洞。Rootless 模式是在 Docker v19.03 版本作为实验性功能引入的，在 Docker v20.10 版本 GA。

Rootless 模式目前对 Cgroups 资源控制，Apparmor 安全配置，Overlay 网络，存储驱动等还有一定的限制，暂时还不能完全取代  “Rootful” Docker。关于 Docker Rootless 的详细信息参见 Docker 官方文档 [ Run the Docker daemon as a non-root user (Rootless mode)](https://docs.docker.com/engine/security/rootless/#limiting-resources)

Rootless 模式利用 user namespaces 将容器中的 root 用户和 Docker 守护进程（dockerd）用户映射到宿主机的非特权用户范围内。Docker 此前已经提供了 `--userns-remap` 标志支持了相关能力，提升了容器的安全隔离性。Rootless 模式在此之上，让 Docker 守护进程也运行在重映射的用户名空间中。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211221101658.png)

## 实践验证
### 环境准备
本文使用 Centos 7.5 操作系统的虚拟机进行实验。
```bash
[root@demo ~]# cat /etc/redhat-release
CentOS Linux release 7.5.1804 (Core)
```

### 创建用户
```bash
useradd rootless
echo 123456 | passwd rootless --stdin
```

### 安装依赖
Rootless 模式可以在没有 root 权限的情况下运行 Docker 守护进程和容器， 但是需要安装 `newuidmap`和`newgidmap` 工具，以便在用户命名空间下创建从属(subordinate)用户和组的映射(remapping)。通过以下命令安装 `newuidmap`  和 `newgidmap` 工具。
```bash
cat <<EOF | sudo sh -x
curl -o /etc/yum.repos.d/vbatts-shadow-utils-newxidmap-epel-7.repo https://copr.fedorainfracloud.org/coprs/vbatts/shadow-utils-newxidmap/repo/epel-7/vbatts-shadow-utils-newxidmap-epel-7.repo
yum install -y shadow-utils46-newxidmap
cat <<EOT >/etc/sysctl.conf
user.max_user_namespaces = 28633
EOT
sysctl --system
EOF
```

### UID/GID 映射配置
从属用户和组的映射由两个配置文件来控制，分别是 `/etc/subuid` 和  `/etc/subgid`。使用以下命令为 rootless 用户设置 65536 个从属用户和组的映射。
```bash
echo "rootless:100000:65536" | tee /etc/subuid
echo "rootless:100000:65536" | tee /etc/subgid
```
对于 subuid，这一行记录的含义为：  用户 rootless，在当前的 user namespace 中具有 65536 个从属用户，用户 ID 为 100000-165535，在一个子 user namespace 中，这些从属用户被映射成 ID 为 0-65535 的用户。subgid 的含义和 subuid 相同。

比如说用户 rootless 在宿主机上只是一个具有普通权限的用户。我们可以把他的一个从属 ID (比如 100000 )分配给容器所属的 user namespace，并把 ID 100000 映射到该 user namespace 中的 uid 0。此时即便容器中的进程具有 root 权限，但也仅仅是在容器所在的 user namespace 中，一旦到了宿主机中，顶多也就有 rootless 用户的权限而已。

### 安装 Rootless Docker
切换到 rootless  用户。
```bash
su - rootless 
```

执行以下命令安装 Rootless Docker。
```bash
curl -fsSL https://get.docker.com/rootless | sh
```

安装成功后显示如下内容。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211226184130.png)

将以下内容添加到 ~/.bashrc 文件中，添加完以后使用 `source ~/.bashrc` 命令使环境变量生效。
```bash
export XDG_RUNTIME_DIR=/home/rootless/.docker/run
export PATH=/home/rootless/bin:$PATH
export DOCKER_HOST=unix:///home/rootless/.docker/run/docker.sock
```

### 启动 Docker 守护进程

使用以下命令启动 Docker 守护进程。
```bash
dockerd-rootless.sh
```

### 运行容器
使用以下命令启动一个 nginx 容器，并将 80 端口映射到宿主机的 8080 端口。
```bash
docker run -d -p 8080:80 nginx
```

查看容器。
```bash
[rootless@demo ~]$ docker ps
CONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS         PORTS                                   NAMES
f3b204c97a84   nginx     "/docker-entrypoint.…"   9 minutes ago   Up 9 minutes   0.0.0.0:8080->80/tcp, :::8080->80/tcp   bold_stonebraker
```
访问容器。
```bash
[rootless@demo ~]$ curl http://localhost:8080

# 返回结果 Nginx 欢迎界面
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

## 参考资料
- [容器安全拾遗 - Rootless Container初探](https://developer.aliyun.com/article/700923)
- [Run the Docker daemon as a non-root user (Rootless mode)](https://docs.docker.com/engine/security/rootless/)
- [Experimenting with Rootless Docker](https://medium.com/@tonistiigi/experimenting-with-rootless-docker-416c9ad8c0d6)
- [浅谈Docker的安全性支持（下篇）](http://blog.itpub.net/31559359/viewspace-2645966/)
- [ Docker v20.10 核心功能介绍和实践](https://mp.weixin.qq.com/s/iMF211vWL722Wqxw9mRf7A)
- [shadow-utils-newxidmap](https://copr.fedorainfracloud.org/coprs/vbatts/shadow-utils-newxidmap/)
- [Hardening Docker Daemon with Rootless Mode](https://www.youtube.com/watch?v=uWURUtqLiqQ)
- [Linux Namespace : User](https://www.cnblogs.com/sparkdev/p/9462838.html)
- [理解 docker 容器中的 uid 和 gid](https://www.cnblogs.com/sparkdev/p/9614164.html)
- [隔离 docker 容器中的用户](https://www.cnblogs.com/sparkdev/p/9614326.html)

## 欢迎关注
![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210306213609.png)
