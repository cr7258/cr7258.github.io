---
title: Golang
author: Se7en
categories:
  - Interview
tags:
  - Golang
---

## 如何限制协程执行数量？

在 Go 中，当我们需要同时执行大量的协程时，可能会因为资源（如 CPU 或内存）的限制，导致性能下降甚至系统崩溃。因此，限制协程的执行数量是控制并发度、提高程序效率的重要手段。

我们可以通过带缓冲的 channel 来控制协程的并发数量。缓冲区大小决定了同时允许多少个协程执行，超出的协程会阻塞，直到有其他协程完成。

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

func main() {
	var wg sync.WaitGroup
	maxWorkers := 3
	sem := make(chan struct{}, maxWorkers) // 通过带缓冲的 channel 来控制协程的并发数量

	// 启动 10 个协程，但最多只会有 maxWorkers 个协程同时执行
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go worker(i, &wg, sem)
	}

	// 等待所有协程完成
	wg.Wait()
}

func worker(id int, wg *sync.WaitGroup, sem chan struct{}) {
	defer wg.Done()
	sem <- struct{}{} // 获取信号

	defer func() {
		<-sem
	}() // 释放信号

	fmt.Printf("Worker %d is working\n", id)
	time.Sleep(2 * time.Second) // 模拟工作
	fmt.Printf("Worker %d done\n", id)
}

// 输出结果
//Worker 9 is working
//Worker 6 is working
//Worker 4 is working
//Worker 4 done
//Worker 5 is working
//Worker 9 done
//Worker 2 is working
//Worker 6 done
//Worker 0 is working
//Worker 0 done
//Worker 7 is working
//Worker 5 done
//Worker 8 is working
//Worker 2 done
//Worker 3 is working
//Worker 3 done
//Worker 1 is working
//Worker 7 done
//Worker 8 done
//Worker 1 done
```

## 函数执行超时控制代码怎么写？

在 Go 中，可以使用 context 包来实现函数执行的超时控制。context.WithTimeout 可以创建一个带有超时的上下文，当超时时间达到时，函数会停止执行。

select 语句用于同时监听任务执行结果和超时信号。如果任务完成，则输出结果；如果超过 2 秒任务未完成，ctx.Done() 会触发超时处理。

```go
package main

import (
	"context"
	"fmt"
	"time"
)

// 模拟一个长时间运行的任务
func longRunningTask(resultChan chan<- string) {
	fmt.Println("Task is running")
	time.Sleep(1 * time.Second)
	resultChan <- "Task is completed"
}

func main() {
	resultChan := make(chan string, 1)

	// 设置超时为2秒
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel() // 保证资源被释放

	// 启动一个 goroutine 执行任务
	go longRunningTask(resultChan)

	// 使用 select 等待任务完成或超时
	select {
	case result := <-resultChan:
		fmt.Println(result)
	case <-ctx.Done():
		fmt.Println("Timeout: Task took too long")
	}
}
```

## sync.Pool 有什么用？

`sync.Pool` 是一个对象缓存池，可以用来存储临时对象，减少对象的创建和销毁次数，提高性能。`sync.Pool` 是并发安全的，可以在多个 goroutine 中并发使用。 使用方法：

- `Get()`：从池中获取一个对象，如果池是空的，则调用 New 创建新对象。
- `Put()`：将对象放回池中，以便复用。

```go
package main

import (
	"fmt"
	"sync"
)

type User struct {
	Name string
}

func main() {
	p := &sync.Pool{
		New: func() interface{} {
			fmt.Println("Creating a new User")
			return &User{Name: "Seven"}
		},
	}

	// 从池中获取一个对象，如果池是空的，则调用 New 创建新对象
	u1 := p.Get().(*User)
	println(u1.Name)
	u1.Name = "Jack"
	// 将对象放回池中，以便复用
	p.Put(u1)

	u2 := p.Get().(*User)
	println(u2.Name)
}

// 输出结果，只创建了一次 User 对象
//Creating a new User
//Seven
//Jack
```

像 gin 框架中的 `Context` 对象就是使用 `sync.Pool` 来复用的。(代码：[ServeHTTP](https://github.com/gin-gonic/gin/blob/f05f966a0824b1d302ee556183e2579c91954266/gin.go#L624-L625))

```go
// ServeHTTP conforms to the http.Handler interface.
func (engine *Engine) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	// 从 sync.Pool 中获取一个 Context 对象
	c := engine.pool.Get().(*Context)
	c.writermem.reset(w)
	c.Request = req
	c.reset()

	engine.handleHTTPRequest(c)

	engine.pool.Put(c)
}
```

## 明明是 nil 却 != nil 的问题

在下面的代码中，虽然变量 a 是 nil，但是在将它赋值给 b（interface{} 类型）之后，b 并 不是 nil。这是因为在 Go 中，interface{} 类型的值由两部分组成：

- 类型（type）：存储的是具体值的类型。
- 值（value）：存储的是具体的值。

当你将 a 赋值给 b 时，b 是一个接口类型，它会包含两部分信息：

- 类型部分是 `*struct{}`（即 b 的类型是 `*struct{}`）。
- 值部分是 nil（因为 a 是一个 nil 指针）。

但是，在 Go 中，一个接口只有在其“类型”和“值”都为 nil 时，才被认为是 nil。在你的代码中，b 的类型是 `*struct{}`，虽然它的值是 nil，但它的类型部分并不是 nil，因此 b != nil。

```go
package main

import "fmt"

func main() {
	var a *struct{}
	var b interface{} = a

	if b == nil {
		fmt.Println("b is nil")
	} else {
		fmt.Println("b is not nil")
	}
}

// 打印结果
//b is not nil
```

## `var data []int` 和 `var data = make([]int, 0)` 有什么区别？

`var data []int` 声明一个切片，初始值为 nil。 `var data = make([]int, 0)` 切片的值不为 nil，而是一个长度和容量都为 0 的空切片。在大多数情况下，推荐使用 var data = make([]int, 0) 来初始化切片。


## 在容器和 Kubernetes 集群中，存在 GOMAXPROCS 会错误识别容器 CPU 核心数的问题

默认情况下，Golang 会将 GOMAXPROCS 设置为 CPU 核心数，这允许 Golang 程序充分使用机器的每一个 CPU，最大程度的提高我们程序的并发性能。
但是在容器中，`runtime.GOMAXPROCS()` 获取的是 宿主机的 CPU 核数 。P 值设置过大，导致生成线程过多，会增加上线文切换的负担，导致严重的上下文切换，浪费 CPU。

解决方案是可以使用 [automaxprocs](https://github.com/uber-go/automaxprocs)，大致原理是读取 CGroup 值识别容器的 CPU quota，计算得到实际核心数，并自动设置 GOMAXPROCS 线程数量。

```go
import _ "go.uber.org/automaxprocs"

func main() {
  // Your application logic here
}

```

参考资料：

- [GOMAXPROCS-POT](https://pandaychen.github.io/2020/02/28/GOMAXPROCS-POT/)