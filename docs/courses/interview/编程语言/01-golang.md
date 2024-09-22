---
title: Golang
author: Se7en
categories:
  - Interview
tags:
  - Golang
---

## `var data []int` 和 `var data = make([]int, 0)` 有什么区别？

`var data []int` 声明一个切片，初始值为 nil。 `var data = make([]int, 0)` 切片的值不为 nil，而是一个长度和容量都为 0 的空切片。在大多数情况下，推荐使用 var data = make([]int, 0) 来初始化切片。