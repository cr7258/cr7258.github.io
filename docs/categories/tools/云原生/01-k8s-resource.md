---
title: 查询 Kubernetes 核心资源字段
author: Se7en
date: 2024/12/15 22:00
categories:
 - Tool
tags:
 - Cloud Native
---

# 查询 Kubernetes 核心资源

## Kubernetes Spec Explorer

[Kubernetes Spec Explorer](https://kubespec.dev/) 记录了 Kubernetes 核心资源字段，并且记录了哪些字段在哪个版本有变更。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202412151931304.png)

比如可以看到 Kubernetes 1.32 版本新增的 Pod Level 的 Resource 字段。([KEP #2837](https://github.com/kubernetes/enhancements/issues/2837))

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202412151931201.png)

## Kaniuse

[Kaniuse](https://kaniuse.vercel.app/kinds) 是一个检查不同版本的 Kubernetes API 资源可用性的工具。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202412151935554.png)
