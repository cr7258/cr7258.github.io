---
title: Linux 速查手册
author: Se7en
date: 2025/10/07 22:00
categories:
 - 个人速查手册
tags:
 - Linux
---

# Linux 速查手册

## 解决 too many open files 错误

出现 `too many open files` 的原因通常有两个：

- 进程打开的文件、socket 或 fsnotify watcher 数量超过 `ulimit -n` 限制；
- 或系统的 inotify 参数（`fs.inotify.max_user_watches` / `max_user_instances`）太低，导致无法再创建新的文件监听器。

临时调整（当前会话有效）：

```bash
# 文件描述符
ulimit -n 65535
# inotify watcher 数量
sudo sysctl -w fs.inotify.max_user_watches=524288
sudo sysctl -w fs.inotify.max_user_instances=1024
```

永久提升：

```bash
# 文件描述符
echo "* soft nofile 65535" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65535" | sudo tee -a /etc/security/limits.conf

# inotify watcher 数量
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
echo "fs.inotify.max_user_instances=1024" | sudo tee -a /etc/sysctl.conf

# 立即生效
sudo sysctl -p
```
