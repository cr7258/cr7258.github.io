---
title: cgroup
author: Se7en
categories:
  - Interview
tags:
  - Operating System
  - cgroup
---

## 如何查看当前系统使用的是 cgroup v1 还是 cgroup v2？

要查看当前系统使用的是 **cgroup v1** 还是 **cgroup v2**，可以通过以下几种方法：

**方法一：使用 `stat` 命令**

执行以下命令：

```bash
stat -fc %T /sys/fs/cgroup/
```

- 如果输出为 `cgroup2fs`，则表示系统正在使用 **cgroup v2**。
- 如果输出为 `tmpfs`，则表示系统正在使用 **cgroup v1**.

**方法二：使用 `mount` 命令**

你也可以通过以下命令检查挂载的文件系统：

```bash
mount | grep cgroup
```

- 如果输出中包含 `cgroup2`，则表示系统正在使用 **cgroup v2**。
- 如果只显示 `cgroup`，则说明是 **cgroup v1**.

**方法三：检查 `/proc/filesystems`**

运行以下命令：

```bash
grep cgroup /proc/filesystems
```

- 如果输出中包含 `nodev cgroup2`，则表示 **cgroup v2** 已安装。
- 如果只显示 `nodev cgroup`，则表示只安装了 **cgroup v1**.

参考资料：

- [Linux Cgroup V2 初体验](https://www.lixueduan.com/posts/linux/08-cgroup-v2/)
