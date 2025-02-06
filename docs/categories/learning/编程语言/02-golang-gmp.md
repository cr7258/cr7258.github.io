---
title: Go GMP
author: Se7en
categories:
 - Programming
tags:
 - Go
 - GMP
---


## GMP

### GMP 架构

gmp = goroutine + machine + processor. 下面我们对这三个核心组件展开介绍：

1）g

- g，即 goroutine，是 golang 中对协程的抽象；
- g 有自己的运行栈、生命周期状态、以及执行的任务函数（用户通过 go func 指定）；
- g 需要绑定在 m 上执行，在 g 视角中，可以将 m 理解为它的 cpu

我们可以把 gmp 理解为一个任务调度系统，那么 g 就是这个系统中所谓的“任务”，是一种需要被分配和执行的“资源”.

2）m

- m 即 machine，是 golang 中对线程的抽象；
- m 需要和 p 进行结合，从而进入到 gmp 调度体系之中
- m 的运行目标始终在 g0 和 g 之间进行切换——当运行 g0 时执行的是 m 的调度流程，负责寻找合适的“任务”，也就是 g；当运行 g 时，执行的是 m 获取到的”任务“，也就是用户通过 go func 启动的 goroutine

当我们把 gmp 理解为一个任务调度系统，那么 m 就是这个系统中的”引擎“. 当 m 和 p 结合后，就限定了”引擎“的运行是围绕着 gmp 这条轨道进行的，使得”引擎“运行着两个周而复始、不断交替的步骤——寻找任务（执行g0）；执行任务（执行 g）

3） p

- p 即 processor，是 golang 中的调度器；
- p 可以理解为 m 的执行代理，m 需要与 p 绑定后，才会进入到 gmp 调度模式当中；因此 p 的数量决定了 g 最大并行数量（可由用户通过 GOMAXPROCS 进行设定，在超过 CPU 核数时无意义）
- p 是 g 的存储容器，其自带一个本地 g 队列（local run queue，简称 lrq），承载着一系列等待被调度的 g

当我们把 gmp 理解为一个任务调度系统，那么 p 就是这个系统中的”中枢“，当其和作为”引擎“ 的 m 结合后，才会引导“引擎”进入 gmp 的运行模式；同时 p 也是这个系统中存储“任务”的“容器”，为“引擎”提供了用于执行的任务资源。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502061421617.png)

参考资料：

- [温故知新——Golang GMP 万字洗髓经](https://mp.weixin.qq.com/s/BR6SO7bQF4UXQoRdEjorAg)
- [深入Go语言之旅 - GMP模型](https://go.cyub.vip/gmp/gmp-model/)