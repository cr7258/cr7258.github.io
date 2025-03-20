---
title: eBPF 基础
author: Se7en
categories:
 - eBPF
tags:
 - eBPF
---

## eBPF 学习资料


|  资料   | 描述  |
|  ----  | ----  |
| [BPF and XDP Reference Guide](https://docs.cilium.io/en/stable/reference-guides/bpf/)  | Cilium 官方编写的 eBPF 参考指南 |
| [eBPF Docs](https://docs.ebpf.io/)  | eBPF 社区的公共知识库，包含各种 eBPF 映射、 eBPF 程序类型以及 eBPF 帮助函数的详细说明 |
| [eBPF & Cilium Community](https://www.youtube.com/@eBPFCilium) | ebpf.io 的 YouTube 频道，包含 eCHO Episode 和 eBPF summit 的视频| 
| [eBPF 开发实践教程](https://eunomia.dev/zh/tutorials/)  | 包含 40+ eBPF 教程以及配套代码 |
| [eBPF核心技术与实战](https://time.geekbang.org/dashboard/course)  | 极客时间 eBPF 教程 |
| [BuildingJohannes Bechberger 的博客](https://mostlynerdless.de/blog/tag/hello-ebpf/)  | 主要介绍使用 Java 来编写 eBPF 程序 | 
| [BPF 进阶笔记](https://arthurchiao.art/blog/bpf-advanced-notes-1-zh/) | 包含 eBPF 类型讲解、eBPF 映射类型、调试 eBPF 程序等内容 |
| [bpf-inside](https://github.com/mannkafai/bpf-inside) | 通过一些小工具探索 eBPF 在 Linux 内核的实现 |


## CORE（Compile Once – Run Everywhere）

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202412022206044.png)

由于 vmlinux.h 文件是由当前运行内核生成的，如果你试图将编译好的 eBPF 程序在另一台运行不同内核版本的机器上运行，可能会面临崩溃的窘境。这主要是因为在不同的版本中，对应数据类型的定义可能会在 Linux 源代码中发生变化。

但是，通过使用 libbpf 库提供的功能可以实现 “CO:RE”（一次编译，到处运行）。libbpf 库定义了部分宏（比如 BPF_CORE_READ），其可分析 eBPF 程序试图访问 vmlinux.h 中定义的类型中的哪些字段。如果访问的字段在当前内核定义的结构中发生了移动，宏 / 辅助函数会协助自动找到对应字段【译者注：对于可能消失的字段，也提供了对应的辅助函数 bpf_core_field_exists】。因此，我们可以使用当前内核中生成的 vmlinux.h 头文件来编译 eBPF 程序，然后在不同的内核上运行它【译者注：需要运行的内核也支持 BTF 内核编译选项】。

https://www.ebpf.top/post/intro_vmlinux_h/

## 参考资料

- [Building BPF applications with libbpf-bootstrap](https://nakryiko.com/posts/libbpf-bootstrap/)
- [BPF CO-RE reference guide](https://nakryiko.com/posts/bpf-core-reference-guide/)
- [BPF CO-RE (Compile Once – Run Everywhere)](https://nakryiko.com/posts/bpf-portability-and-co-re/)

- [Eunomia: 让 ebpf 程序的分发和使用像网页和 web 服务一样自然](https://zhuanlan.zhihu.com/p/555362934)
- [eunomia-bpf: 一个开源的 ebpf 动态加载运行时和开发工具链](https://www.bilibili.com/video/BV1DG4y1N76m)

- [[译] BPF ring buffer：使用场景、核心设计及程序示例（2020）](https://arthurchiao.art/blog/bpf-ringbuf-zh/)