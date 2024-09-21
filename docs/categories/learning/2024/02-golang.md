---
title: Go 并发编程
author: Se7en
date: 2024/09/21 09:00
categories:
 - Programming
tags:
 - Go
 - Concurrency
---



## Go 的并发机制

### Channel 通道

struct{} 代表的是不包含任何字段的结构体类型，也可称为空结构体类型。在 Go 语言中，空结构体类型的变量是不占用内存空间的，并且所有该类型的变量都拥有相同的内存地址。建议用于传递“信号”的通道都以 struct{} 作为元素类型，除非需要传递更多的信息。

如果有多个 goroutine 因同一个已满的通道发送元素值而被阻塞，那么当该通道中有多余空间的时候，最早被阻塞的那个 goroutine 会最先被唤醒。对于接收操作来说，也是如此，一旦已空的通道中有了新的元素值，那么最早因从该通道接收元素值而阻塞的那个 goroutine 会最先被唤醒。并且，Go 运行时系统每次只会唤醒一个 goroutine。

#### 通道发送的值会被复制

发送方向通道发送的值会被复制，接收方接收的总是该值的副本，而不是该值本身。因此，当接收方从通道接收到一个值类型的值时，对该值的修改就不会影响到发送方持有的那个源值。但对于引用类型的值来说，这种修改会同时影响收发双方持有的值。

```go
package main

import (
	"fmt"
	"time"
)

var mapChan = make(chan map[string]int, 1)

func main() {
	syncChan := make(chan struct{}, 2)
	go func() { // 用于演示接收操作。
		for {
			if elem, ok := <-mapChan; ok {
				elem["count"]++
			} else {
				break
			}
		}
		fmt.Println("Stopped. [receiver]")
		syncChan <- struct{}{}
	}()
	go func() { // 用于演示发送操作。
		countMap := make(map[string]int)
		for i := 0; i < 5; i++ {
			mapChan <- countMap
			time.Sleep(time.Millisecond)
			fmt.Printf("The count map: %v. [sender]\n", countMap)
		}
		close(mapChan)
		syncChan <- struct{}{}
	}()
	<-syncChan
	<-syncChan
}
```

如上述代码所示，`mapChan` 的元素类型属于引用类型。因此，接收方对元素值的副本的修改会影响到发送方持有的源值。运行该程序会得到如下输出：

```go
The count map: map[count:1]. [sender]
The count map: map[count:2]. [sender]
The count map: map[count:3]. [sender]
The count map: map[count:4]. [sender]
The count map: map[count:5]. [sender]
Stopped. [receiver]
```

#### 关闭通道

- 应该在发送端关闭通道，而不是接收端，因为接收端通常无法判断发送端是否还会向该通道发送元素值。
- 试图向一个已关闭的通道发送元素值，会让发送操作引发运行时恐慌。
- 在发送端关闭通道一般不会对接收端的接收操作产生影响，如果通道在关闭时其中仍有元素值，你依然可以用接收表达式取出，并根据该表达式的第二个结果值判断通道是否已关闭且已无元素值可取。
- 对于同一个通道仅允许关闭一次，对通道的重复关闭会引发运行时恐慌。
- 在调用 `close` 函数时，你需要把代表欲关闭的那个通道的变量作为参数传入。如果此时该变量的值为 `nil`，就会引发运行时恐慌。

```go
package main

import "fmt"

func main() {
	dataChan := make(chan int, 5)
	syncChan1 := make(chan struct{}, 1)
	syncChan2 := make(chan struct{}, 2)
	go func() { // 用于演示接收操作。
		<-syncChan1
		for {
			if elem, ok := <-dataChan; ok {
				fmt.Printf("Received: %d [receiver]\n", elem)
			} else {
				break
			}
		}
		fmt.Println("Done. [receiver]")
		syncChan2 <- struct{}{}
	}()
	go func() { // 用于演示发送操作。
		for i := 0; i < 5; i++ {
			dataChan <- i
			fmt.Printf("Sent: %d [sender]\n", i)
		}
		close(dataChan)
		syncChan1 <- struct{}{}
		fmt.Println("Done. [sender]")
		syncChan2 <- struct{}{}
	}()
	<-syncChan2
	<-syncChan2
}
```

在发送方，我在向通道 `dataChan` 发送完所有元素值并关闭通道之后，才告知接收方开始接收。虽然通道已经关闭，但是对于接收操作并无影响，接收发依然可以在接收完所有值后自行结束。运行该程序会得到如下输出：

```go
Sent: 0 [sender]
Sent: 1 [sender]
Sent: 2 [sender]
Sent: 3 [sender]
Sent: 4 [sender]
Done. [sender]
Received: 0 [receiver]
Received: 1 [receiver]
Received: 2 [receiver]
Received: 3 [receiver]
Received: 4 [receiver]
Done. [receiver]
```