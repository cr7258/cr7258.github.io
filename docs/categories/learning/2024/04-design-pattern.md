---
title: 设计模式
author: Se7en
date: 2024/09/21 09:00
categories:
 - Programming
 - Design Pattern
tags:
 - Design Pattern
---


## 创建型模式

### 单例模式（Singleton）

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202411051557458.png)

```go
import "sync"

//Singleton 是单例模式类
type Singleton struct{}

var singleton *Singleton
var once sync.Once

//GetInstance 用于获取单例模式对象
func GetInstance() *Singleton {
	once.Do(func() {
		singleton = &Singleton{}
	})

	return singleton
}
```

### 创建者模式（Builder）

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202411051607576.png)

```go
type Builder interface {
	Part1()
	Part2()
	Part3()
}

type Director struct {
	builder Builder
}

func NewDirector(builder Builder) *Director {
	return &Director{
		builder: builder,
	}
}

func (d *Director) Construct() {
	d.builder.Part1()
	d.builder.Part2()
	d.builder.Part3()
}

type Builder1 struct {
	result string
}

func (b *Builder1) Part1() {
	b.result += "1"
}

func (b *Builder1) Part2() {
	b.result += "2"
}

func (b *Builder1) Part3() {
	b.result += "3"
}

func (b *Builder1) GetResult() string {
	return b.result
}

type Builder2 struct {
	result int
}

func (b *Builder2) Part1() {
	b.result += 1
}

func (b *Builder2) Part2() {
	b.result += 2
}

func (b *Builder2) Part3() {
	b.result += 3
}

func (b *Builder2) GetResult() int {
	return b.result
}
```


## 参考资料

- [golang-design-pattern](https://github.com/ssbandjl/golang-design-pattern)
- [Easy搞定Golang设计模式(学Go语言设计模式，如此简单!)](https://space.bilibili.com/373073810/channel/collectiondetail?sid=734579&spm_id_from=333.788.0.0)