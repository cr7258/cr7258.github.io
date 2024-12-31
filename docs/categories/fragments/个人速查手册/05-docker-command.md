---
title: Docker 常用命令
author: Se7en
date: 2024/12/32 19:00
categories:
 - 个人速查手册
tags:
 - Docker
---

# Docker 常用命令

## 列出指定条件的容器

可以使用 `--filter` 参数来筛选满足指定条件的容器，参考文档：[docker container ls](https://docs.docker.com/reference/cli/docker/container/ls/#filter)，常见的参数如下：

- name：容器名称
- ancestor：镜像名称
- label：标签
- status：容器状态

以下命令列出了所有镜像是 `fluent/fluentd:edge-debian` 的容器。

```bash
docker ps -a --filter ancestor=fluent/fluentd:edge-debian
CONTAINER ID   IMAGE                        COMMAND                  CREATED        STATUS                    PORTS     NAMES
8bb44579fbc1   fluent/fluentd:edge-debian   "tini -- /bin/entryp…"   4 months ago   Exited (0) 4 months ago             crazy_raman
10385990750b   fluent/fluentd:edge-debian   "tini -- /bin/entryp…"   4 months ago   Exited (0) 4 months ago             dreamy_bell
493fcea42f53   fluent/fluentd:edge-debian   "tini -- /bin/entryp…"   4 months ago   Exited (0) 4 months ago             flamboyant_roentgen
c68932dfd813   fluent/fluentd:edge-debian   "tini -- /bin/entryp…"   4 months ago   Exited (1) 4 months ago             hopeful_carson
a174647e9e5a   fluent/fluentd:edge-debian   "tini -- /bin/entryp…"   4 months ago   Exited (1) 4 months ago             eager_goldstine
3401e866295f   fluent/fluentd:edge-debian   "tini -- /bin/entryp…"   4 months ago   Exited (1) 4 months ago             hopeful_wozniak
a4bfc39b1f43   fluent/fluentd:edge-debian   "tini -- /bin/entryp…"   4 months ago   Exited (0) 4 months ago             frosty_margulis
fc4282a232dd   fluent/fluentd:edge-debian   "tini -- /bin/entryp…"   4 months ago   Exited (0) 4 months ago             cool_shannon
```

## 批量删除容器

可以先[列出指定条件的容器](#列出指定条件的容器)，然后使用 `docker rm` 命令进行批量删除。`-q` 参数会只输出容器 id，这样就无需处理其他字段和表头了。


```bash
docker rm $(docker ps -aq --filter ancestor=fluent/fluentd:edge-debian)
```
