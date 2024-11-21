---
title: Go 并发编程
author: Se7en
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

#### 单向通道

通过 `chan T` 方式声明的通道是双向的。可以使用接收操作符 `<-` 来声明单向的通道类型，接收操作符 `<-` 很形象地表示了元素值的流向。

```bash
# 单向发送通道
chan<- T

# 单向接收通道
<-chan T
```

需要注意的是，无论哪一种单向通道，都不应该出现在变量的声明中，因为一个只进不出的通道或者一个只出不进的通道都是没有任何意义的。**单向通道应该由双向通道变换而来。** 我们可以用这种变换来约束程序对通道的使用方式。
例如 `os/signal.Notify` 函数的声明是这样的：

```go
func Notify(c chan<- os.Signal, sig ...os.Signal)
```

该函数的第一个参数的类型是发送通道类型。从表明上来看，调用它的程序需要传入一个只能发送而不能接收的通道。然而并不应该如此，在调用该函数时，你应该传入一个双向通道。Go 会依据该参数的声明，自动把它转换为单向通道。`Notify` 函数中的代码只能向通道 `c` 发送元素值，而不能从它那里接收元素值。这是一个强约束。在该函数中从通道 `c` 接收元素值会造成编译错误。

以下代码用单向通道约束了用于发送和接收的函数，`receiver` 函数只能对 `strChan` 和 `syncChan` 通道进行接收操作，而 `send` 函数只能对这两个通道进行发送操作。

```go
package main

import (
	"fmt"
	"time"
)

var strChan = make(chan string, 3)

func main() {
	syncChan1 := make(chan struct{}, 1)
	syncChan2 := make(chan struct{}, 2)
	go receive(strChan, syncChan1, syncChan2) // 用于演示接收操作。
	go send(strChan, syncChan1, syncChan2)    // 用于演示发送操作。
	<-syncChan2
	<-syncChan2
}

func receive(strChan <-chan string,
	syncChan1 <-chan struct{},
	syncChan2 chan<- struct{}) {
	<-syncChan1
	fmt.Println("Received a sync signal and wait a second... [receiver]")
	time.Sleep(time.Second)
	for {
		if elem, ok := <-strChan; ok {
			fmt.Println("Received:", elem, "[receiver]")
		} else {
			break
		}
	}
	fmt.Println("Stopped. [receiver]")
	syncChan2 <- struct{}{}
}

func send(strChan chan<- string,
	syncChan1 chan<- struct{},
	syncChan2 chan<- struct{}) {
	for _, elem := range []string{"a", "b", "c", "d"} {
		fmt.Println("Sent:", elem, "[sender]")
		strChan <- elem
		if elem == "c" {
			syncChan1 <- struct{}{}
			fmt.Println("Sent a sync signal. [sender]")
		}
	}
	fmt.Println("Wait 2 seconds... [sender]")
	time.Sleep(time.Second * 2)
	close(strChan)
	syncChan2 <- struct{}{}
}
```

执行该程序会得到如下输出：

```go
Sent: a [sender]
Sent: b [sender]
Sent: c [sender]
Sent a sync signal. [sender]
Sent: d [sender]
Received a sync signal and wait a second... [receiver]
Received: a [receiver]
Received: b [receiver]
Received: c [receiver]
Received: d [receiver]
Wait 2 seconds... [sender]
Stopped. [receiver]
```

#### for 语句与 channel

我们可以使用 `range` 子句来持续地从一个通道中接收元素。当通道中没有任何元素时，`for` 语句所在的 goroutine 会陷入阻塞。`for` 语句会不断地尝试从通道中接收元素，直到该通道关闭。我们可以改写上面的 `receive` 函数，以使用于接收操作的代码更简洁：

```go
for elem := range strChan {
	fmt.Println("Received:", elem, "[receiver]")
}
```

#### select 语句

`select` 语句是一种仅能用于通道发送和接收操作的专用语句。一条 `select` 语句执行时，会选择其中的某一个分支并执行。

这条 `select` 语句中有两个普通的 `case`，每个 `case` 都包含一条针对不同通道的接收语句。此外，该 `select` 也包含了一个 `default case`（也称默认分支）。如果 `select` 语句中的所有普通 `case` 都不满足选择条件，`default case` 就会被选中。

```go
package main

import "fmt"

var intChan = make(chan int, 10)
var strChan = make(chan string, 10)

func main() {
	select {
	case <-intChan:
		fmt.Println("The 1th case was selected.")
	case <-strChan:
		fmt.Println("The 1th case was selected.")
	default:
		fmt.Println("Default")
	}
}
```

注意，如果 `select` 语句中的所有 `case` 都不满足条件，并且没有 `default case`，那么当前 goroutine 就会一直阻塞于此，直到至少有一个 `case` 中的发送或接收操作可以立即进行为止。如果程序只有主 goroutine 且包含了这样的代码，那么就会发生死锁！

**如果同时有多个 `case` 满足条件，那么运行时系统会通过一个伪随机的算法选中一个 `case`。** 多次运行该程序后你会发现，几乎每次输出的数字序列都不完全相同。

```go
package main

import "fmt"

func main() {
	chanCap := 5
	intChan := make(chan int, chanCap)
	for i := 0; i < chanCap; i++ {
		select {
		case intChan <- 1:
		case intChan <- 2:
		case intChan <- 3:
		}
	}
	for i := 0; i < chanCap; i++ {
		fmt.Printf("%d\n", <-intChan)
	}
}
```

#### time 包与 channel

##### 定时器 Timer

在 `time.Timer` 类型中，对外通知定时器到期的途径就是通道，用字段 `C` 代表。一旦触及到期时间，定时器就会向它的通道发送一个元素值。
使用定时器，我们可以便捷地实现对接收操作的超时设定，如下面代码所示：

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	intChan := make(chan int, 1)
	go func() {
		time.Sleep(time.Second)
		intChan <- 1
	}()
	select {
	case e := <-intChan:
		fmt.Printf("Received: %v\n", e) 
    // case <-time.NewTimer(time.Millisecond * 500).C:
    // 与前者等价
	case <-time.After(time.Millisecond * 500):
		fmt.Println("Timeout!")
	}
}
```

`time.Timer` 中包含了两个方法：`Reset` 和 `Stop`。`Reset` 方法会重置定时器的到期时间，而 `Stop` 方法会停止定时器。它们的返回值都是 bool 类型，如果值为 false，说明该定时器早已到期（或者说已经过期）或者已被停止，否则就说明该定时器刚刚由于方法的调用而被停止。
我改造了前一个程序，在用于接收操作的 `for` 语句的开始做了一个额外的处理，这使得 `timer` 总是在当前迭代开始时（再次）启动。在需要频繁使用相对到期时间相同的定时器的情况下，你总是应该尽量复用，而不是重新创建定时器。

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	intChan := make(chan int, 1)
	go func() {
		for i := 0; i < 5; i++ {
			time.Sleep(time.Second)
			intChan <- i
		}
		close(intChan)
	}()
	timeout := time.Millisecond * 500
	var timer *time.Timer
	for {
		if timer == nil {
			timer = time.NewTimer(timeout)
		} else {
			timer.Reset(timeout)
		}
		select {
		case e, ok := <-intChan:
			// 当通道关闭并且通道中的元素为空时，ok 的值为 false
			if !ok {
				fmt.Println("End.")
				return
			}
			fmt.Printf("Received: %v\n", e)
		case <-timer.C:
			fmt.Println("Timeout!")
		}
	}
}
```

##### 断续器 Ticker

`time.Ticker` 中只有一个 `Stop` 方法，用于停止断续器。定时器在重置之前只会到期一次，而断续器则会在到期后立即进入下一个周期并等待再次到期，周而复始，直到被停止。
`Stop` 方法会停止 Ticker，停止后，Ticker 不会再被发送，但是 `Stop` 不会关闭通道，这是为了防止读取通道发生错误。

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	intChan := make(chan int, 1)
	ticker := time.NewTicker(time.Second)
	done := make(chan bool)

	go func() {
		defer ticker.Stop()
		for {
			select {
			case <-done:
				fmt.Println("End. [sender]")
				return
			case <-ticker.C:
				select {
				case intChan <- 1:
				case intChan <- 2:
				case intChan <- 3:
				}
			}
		}
	}()

	var sum int
	for e := range intChan {
		fmt.Printf("received %v\n", e)
		sum += e
		if sum > 10 {
			fmt.Printf("Got %v\n", sum)
			break
		}
	}
	fmt.Println("End. [receiver]")
	close(done)             // 通知发送者 goroutine 结束
	time.Sleep(time.Second) // 给发送者一些时间来打印

}
```

程序的输出结果如下：

```go
received 1
received 3
received 1
received 3
received 2
received 3
Got 13
End. [receiver]
End. [sender]
```
