---
title: 5 种快速查找容器中文件的方法
author: Se7en
date: 2024/07/20 19:00
categories:
 - 个人速查手册
tags:
 - Docker
---

# 5 种快速查找容器中文件的方法

## 创建一个示例容器
```sh
docker run -itd --name mycontainer busybox
```

## 方法一：Exec 到容器中
这种方法的一个缺点是，**它需要在容器中存在一个 shell**。如果容器中没有/bin/bash、/bin/sh 或其他 shell，那么这种方法将不起作用。
```bash
docker exec -it mycontainer /bin/sh

# 查看容器内文件
/ # ls
bin   dev   etc   home  proc  root  sys   tmp   usr   var
```

## 方法二：使用 nsenter
nsenter 命令 是一个可以在指定进程的命名空间下运行指定程序的命令。如果你再深入一点，就会意识到容器进程与 Linux 主机上的其他进程一样，只是在命名空间中运行，以使它们与系统的其他部分隔离。

首先获取容器内进程在宿主机的 PID。
```bash
PID=$(docker container inspect mycontainer |jq '.[0].State.Pid')
```
![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211125093506.png)
然后使用 nsenter 命令来进入目标容器的命名空间。`-m` 参数表示进入 mount 命名空间。`-t` 参数指定进入命名空间的目标进程的 pid。
```bash
sudo nsenter -m -t $PID /bin/sh

# 查看容器内文件，此时可以看到前面还有宿主机的主机名，只是进入了目标容器的命名空间
root@ydt-net-portainer:/ #ls
bin   dev   etc   home  proc  root  sys   tmp   usr   var
```

**使用 nsenter 这种方法同样要求目标容器中包含 /bin/bash（或其他 shell）。**

## 方法三：使用 docker 复制
可以直接将目标容器中的文件直接复制到宿主机中，**不需要目标容器中包含 /bin/bash（或其他 shell）**。
```bash
docker cp mycontainer:/path/to/file file
```

## 方法四：在主机上查找文件系统
```bash
docker container inspect mycontainer | jq '.[0].GraphDriver'

# 返回结果
{
		"Data": {
			"LowerDir": "/var/lib/docker/overlay2/28efaabd0fb7ee3b42f8799e42752aa5fed96a5094064a044c9f410a29398ce7-init/diff:/var/lib/docker/overlay2/72c0b407cb9f4c080754b4377abc210726188d3941599456101a047d6ba6f002/diff",
			"MergedDir": "/var/lib/docker/overlay2/28efaabd0fb7ee3b42f8799e42752aa5fed96a5094064a044c9f410a29398ce7/merged",
			"UpperDir": "/var/lib/docker/overlay2/28efaabd0fb7ee3b42f8799e42752aa5fed96a5094064a044c9f410a29398ce7/diff",
			"WorkDir": "/var/lib/docker/overlay2/28efaabd0fb7ee3b42f8799e42752aa5fed96a5094064a044c9f410a29398ce7/work"
		},
		"Name": "overlay2"
}

```

让我们来分析一下：
-   LowerDir：包含容器内所有层的文件系统，最后一层除外（只读）。
-   UpperDir：容器最上层的文件系统。这也是反映任何运行时修改的地方（读写）。
-   MergedDir：文件系统所有层的组合视图。
-   WorkDir：用于管理文件系统的内部工作目录。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20211125094631.png)

因此，要查看容器中的文件，只需查看 MergedDir 路径。这种方法**不需要目标容器中包含 /bin/bash（或其他 shell）。**
```bash
root@ydt-net-portainer:/root #ls /var/lib/docker/overlay2/28efaabd0fb7ee3b42f8799e42752aa5fed96a5094064a044c9f410a29398ce7/merged
bin  dev  etc  home  proc  root  sys  tmp  usr  var
```

## 方法五： `/proc/<pid>/root` （推荐）
还有一种从主机找到容器文件系统的更简单的方法。使用容器内进程的宿主 PID，你可以简单地运行：
```bash
sudo ls /proc/<pid>/root

# 返回结果
root@ydt-net-portainer:/root #sudo ls /proc/94138/root
bin  dev  etc  home  proc  root  sys  tmp  usr  var
```
Linux 已经为你提供了进程挂载命名空间的视图。

## 参考资料
- [5 种快速查找容器文件系统中文件的方法](https://mp.weixin.qq.com/s/OffLxIO0NBC5vLikfCu2Ig)
- [nsenter命令简介](https://staight.github.io/2019/09/23/nsenter%E5%91%BD%E4%BB%A4%E7%AE%80%E4%BB%8B/)
- [Deep Dive into Docker Internals - Union Filesystem](https://martinheinz.dev/blog/44)
