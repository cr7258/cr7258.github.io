---
title: 经典设计问题
author: Se7en
categories:
  - Algorithm
tags:
  - Algorithm
---

## [LRU 缓存](https://leetcode.cn/problems/lru-cache/description/)

请你设计并实现一个满足 LRU (最近最少使用) 缓存约束的数据结构。

实现 LRUCache 类：
- LRUCache(int capacity) 以 正整数 作为容量 capacity 初始化 LRU 缓存
- int get(int key) 如果关键字 key 存在于缓存中，则返回关键字的值，否则返回 -1 。
- void put(int key, int value) 如果关键字 key 已经存在，则变更其数据值 value；如果不存在，则向缓存中插入该组 key-value。如果插入操作导致关键字数量超过 capacity ，则应该逐出最久未使用的关键字。
- 函数 get 和 put 必须以 O(1) 的平均时间复杂度运行。

示例：

```go

输入
["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]
[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]
输出
[null, null, null, 1, null, -1, null, -1, 3, 4]

解释
LRUCache lRUCache = new LRUCache(2);
lRUCache.put(1, 1); // 缓存是 {1=1}
lRUCache.put(2, 2); // 缓存是 {1=1, 2=2}
lRUCache.get(1);    // 返回 1
lRUCache.put(3, 3); // 该操作会使得关键字 2 作废，缓存是 {1=1, 3=3}
lRUCache.get(2);    // 返回 -1 (未找到)
lRUCache.put(4, 4); // 该操作会使得关键字 1 作废，缓存是 {4=4, 3=3}
lRUCache.get(1);    // 返回 -1 (未找到)
lRUCache.get(3);    // 返回 3
lRUCache.get(4);    // 返回 4
```

**题解**

- 1.首先，题目中提到函数 get 和 put 必须以 O(1) 的平均时间复杂度运行，很自然地我们可以想到应该使用哈希表。
- 2.其次，当访问数据结构中的某个 key 时，需要将这个 key 更新为最近使用；另外如果 capacity 已满，需要删除访问时间最早的那条数据。这要求数据是有序的，并且可以支持在任意位置快速插入和删除元素，链表可以满足这个要求。
- 3.结合 1，2 两点来看，我们可以采用哈希表 + 链表的结构实现 LRU 缓存。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410241623648.png)

```go
package main

import "fmt"

// LRU 数据结构
type LRUCache struct {
	capacity   int                  // 容量
	size       int                  // 已使用空间
	head, tail *DLinkedNode         // 头节点，尾节点
	cache      map[int]*DLinkedNode // 哈希表
}

// 双向链表数据结构
type DLinkedNode struct {
	key, value int
	prev, next *DLinkedNode // 前指针，后指针
}

// 创建一个新的节点
func initDLinkedNode(key, value int) *DLinkedNode {
	return &DLinkedNode{
		key:   key,
		value: value,
	}
}

// 初始化 LRU 结构
func Constructor(capacity int) LRUCache {
	l := LRUCache{
		cache:    map[int]*DLinkedNode{}, //  哈希表
		head:     initDLinkedNode(0, 0),  // 虚拟头节点
		tail:     initDLinkedNode(0, 0),  // 虚拟尾节点
		capacity: capacity,               // 容量
	}
	// 虚拟头节点和虚拟尾节点互连
	l.head.next = l.tail
	l.tail.prev = l.head
	return l
}

// 获取元素
func (this *LRUCache) Get(key int) int {
	// 如果没有在哈希表中找到 key
	if _, ok := this.cache[key]; !ok {
		return -1
	}
	// 如果 key 存在，先通过哈希表定位，再移到头部
	node := this.cache[key]
	this.moveToHead(node)
	return node.value
}

// 插入元素
func (this *LRUCache) Put(key int, value int) {
	// 先去哈希表中查询
	// 如果 key 不存在，创建一个新的节点
	if node, ok := this.cache[key]; !ok {
		newNode := initDLinkedNode(key, value)
		// 如果达到容量限制，链表删除尾部节点，哈希表删除元素
		this.size++
		if this.size > this.capacity {
			// 得到删除的节点
			removed := this.removeTail()
			// 根据得到的 key 删除哈希表中的元素
			delete(this.cache, removed.key)
			// 减少已使用容量
			this.size--
		}
		// 插入哈希表
		this.cache[key] = newNode
		// 插入链表
		this.addToHead(newNode)
	} else { // 如果 key 存在，先通过哈希表定位，再修改 value，并移到头部
		node.value = value
		this.moveToHead(node)
	}
}

// 将节点添加到头部
func (this *LRUCache) addToHead(node *DLinkedNode) {
	// 新节点指向前后节点
	node.prev = this.head
	node.next = this.head.next
	
	// 前后节点指向新节点
	this.head.next.prev = node
	this.head.next = node
}

// 删除该节点
func (this *LRUCache) removeNode(node *DLinkedNode) {
	// 修改该节点前后节点的指针，不再指向该节点
	node.next.prev = node.prev
	node.prev.next = node.next
}

// 移动到头部，也就是当前位置删除，再添加到头部
func (this *LRUCache) moveToHead(node *DLinkedNode) {
	this.removeNode(node)
	this.addToHead(node)
}

// 移除尾部节点，淘汰最久未使用的
func (this *LRUCache) removeTail() *DLinkedNode {
	node := this.tail.prev // 虚拟尾节点的上一个才是真正的尾节点
	this.removeNode(node)
	return node
}
```

## [LFU 缓存](https://leetcode.cn/problems/lfu-cache/description/)

请你为最不经常使用（LFU）缓存算法设计并实现数据结构。

实现 LFUCache 类：

- `LFUCache(int capacity)` - 用数据结构的容量 capacity 初始化对象。
- `int get(int key)` - 如果键 key 存在于缓存中，则获取键的值，否则返回 -1 。
- `void put(int key, int value)` - 如果键 key 已存在，则变更其值；如果键不存在，请插入键值对。当缓存达到其容量 capacity 时，则应该在插入新项之前，移除最不经常使用的项。在此问题中，当存在平局（即两个或更多个键具有相同使用频率）时，应该去除最久未使用的键。

为了确定最不常使用的键，可以为缓存中的每个键维护一个使用计数器。使用计数最小的键是最久未使用的键。

当一个键首次插入到缓存中时，它的使用计数器被设置为 1 (由于 put 操作)。对缓存中的键执行 get 或 put 操作，使用计数器的值将会递增。

函数 get 和 put 必须以 O(1) 的平均时间复杂度运行。

示例：

```go
输入：
["LFUCache", "put", "put", "get", "put", "get", "get", "put", "get", "get", "get"]
[[2], [1, 1], [2, 2], [1], [3, 3], [2], [3], [4, 4], [1], [3], [4]]
输出：
[null, null, null, 1, null, -1, 3, null, -1, 3, 4]

解释：
// cnt(x) = 键 x 的使用计数
// cache=[] 将显示最后一次使用的顺序（最左边的元素是最近的）
LFUCache lfu = new LFUCache(2);
lfu.put(1, 1);   // cache=[1,_], cnt(1)=1
lfu.put(2, 2);   // cache=[2,1], cnt(2)=1, cnt(1)=1
lfu.get(1);      // 返回 1
                 // cache=[1,2], cnt(2)=1, cnt(1)=2
lfu.put(3, 3);   // 去除键 2 ，因为 cnt(2)=1 ，使用计数最小
                 // cache=[3,1], cnt(3)=1, cnt(1)=2
lfu.get(2);      // 返回 -1（未找到）
lfu.get(3);      // 返回 3
                 // cache=[3,1], cnt(3)=2, cnt(1)=2
lfu.put(4, 4);   // 去除键 1 ，1 和 3 的 cnt 相同，但 1 最久未使用
                 // cache=[4,3], cnt(4)=1, cnt(3)=2
lfu.get(1);      // 返回 -1（未找到）
lfu.get(3);      // 返回 3
                 // cache=[3,4], cnt(4)=1, cnt(3)=3
lfu.get(4);      // 返回 4
                 // cache=[3,4], cnt(4)=2, cnt(3)=3
```

**题解**

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501212207446.png)

```go
type Node struct {
    key, value, freq int
    prev, next *Node
}

type DLinkedList struct {
    head, tail *Node
    size       int
}

func newDLinkedList() *DLinkedList {
    list := &DLinkedList{
        head: &Node{},
        tail: &Node{},
    }
    list.head.next = list.tail
    list.tail.prev = list.head
    return list
}

func (l *DLinkedList) addNode(node *Node) {
    node.prev = l.head
    node.next = l.head.next
    l.head.next.prev = node
    l.head.next = node
    l.size++
}

func (l *DLinkedList) removeNode(node *Node) {
    node.prev.next = node.next
    node.next.prev = node.prev
    l.size--
}

func (l *DLinkedList) removeLast() *Node {
    if l.size > 0 {
        lastNode := l.tail.prev
        l.removeNode(lastNode)
        return lastNode
    }
    return nil
}

type LFUCache struct {
    capacity    int
    size        int
    minFreq     int
    keyToNode   map[int]*Node
    freqToList  map[int]*DLinkedList
}

func Constructor(capacity int) LFUCache {
    return LFUCache{
        capacity:   capacity,
        keyToNode:  make(map[int]*Node),
        freqToList: make(map[int]*DLinkedList),
    }
}

func (c *LFUCache) updateFreq(node *Node) {
    // 从原频率链表中删除
    freq := node.freq
    c.freqToList[freq].removeNode(node)
    
    // 如果当前频率的链表为空且是最小频率，更新最小频率
    if c.minFreq == freq && c.freqToList[freq].size == 0 {
        c.minFreq++
    }
    
    // 将节点加入新频率的链表
    node.freq++
    if _, ok := c.freqToList[node.freq]; !ok {
        c.freqToList[node.freq] = newDLinkedList()
    }
    c.freqToList[node.freq].addNode(node)
}

func (c *LFUCache) Get(key int) int {
    if node, ok := c.keyToNode[key]; ok {
        c.updateFreq(node)
        return node.value
    }
    return -1
}

func (c *LFUCache) Put(key int, value int) {
    if c.capacity == 0 {
        return
    }
    
    // 如果键已存在，更新值和频率
    if node, ok := c.keyToNode[key]; ok {
        node.value = value
        c.updateFreq(node)
        return
    }
    
    // 如果缓存已满，删除使用频率最小的元素中最久未使用的那个
    if c.size >= c.capacity {
        minFreqList := c.freqToList[c.minFreq]
        deletedNode := minFreqList.removeLast()
        delete(c.keyToNode, deletedNode.key)
        c.size--
    }
    
    // 插入新节点
    newNode := &Node{key: key, value: value, freq: 1}
    c.keyToNode[key] = newNode
    if _, ok := c.freqToList[1]; !ok {
        c.freqToList[1] = newDLinkedList()
    }
    c.freqToList[1].addNode(newNode)
    c.minFreq = 1
    c.size++
}
```

## 带权随机选择

带权随机选择(Weighted Random) 的核心是：根据每个对象的权重进行概率性地选择。权重越大，被选中的概率越高。实现方式通常分为两步：

- 计算所有对象的权重和 totalWeight。
- 从区间 [0, totalWeight) 中随机生成一个值 r，然后遍历所有对象的权重累加值，一旦累加值超过 r，就返回该对象。
- 每次都用随机数落在 [0, totalWeight) 区间，根据累加判断选中谁，**短期内有随机波动**。

```go
package main

import (
	"fmt"
	"math/rand"
	"time"
)

// WeightedItem 用来表示带权的对象
type WeightedItem struct {
	Value  string
	Weight int
}

// WeightedRandom 从给定的 weightedItems 中，随机返回一个对象
func WeightedRandom(weightedItems []WeightedItem) *WeightedItem {
	if len(weightedItems) == 0 {
		return nil
	}
	// 计算权重总和
	totalWeight := 0
	for _, item := range weightedItems {
		totalWeight += item.Weight
	}

	// 在 [0, totalWeight) 区间内取随机数
	r := rand.Intn(totalWeight)

	// 遍历找到对应区间的对象
	cumulative := 0
	for _, item := range weightedItems {
		cumulative += item.Weight
		if r < cumulative {
			return &item
		}
	}

	return nil
}

func main() {
	rand.Seed(time.Now().UnixNano()) // 初始化随机种子

	items := []WeightedItem{
		{Value: "A", Weight: 1},
		{Value: "B", Weight: 2},
		{Value: "C", Weight: 5},
	}

	// 统计多次测试的分布
	count := map[string]int{}
	for i := 0; i < 100; i++ {
		sel := WeightedRandom(items)
		fmt.Print(sel.Value)
		count[sel.Value]++
	}

	fmt.Println("\nCount Distribution:", count)
}


// 输出结果
// AACBCBCCCCBCBCCAACBCCCBACBCAACCCBBCCCCCCBCCCCCCCCCCCCCBCCCCCCCBCBCCBBACABCCCCCCBCBBABBAABABCCCCCCBCA
// Count Distribution: map[A:14 B:24 C:62]
```

## 平滑加权轮询

在平滑加权轮询（Smooth Weighted Round Robin）算法里，维护一个 currentWeight（有时也称“当前负载”或“当前权重”）是实现“平滑”效果的关键所在。它的作用主要有以下几点：

- **逐步累加、确保“饿”的节点能被选中**：
    - 每轮调度前，会对每个节点的 currentWeight 加上它的静态 Weight。
    - 如果某个节点好几轮都没被选中，那么它的 currentWeight 将持续累加、不断增大。这样一来，它就能“追赶”或超过其他节点的 currentWeight，从而在下一轮调度时被选中。
    这种逻辑可以理解为“节点越久没被选中，下次优先级会越高”，有助于更平滑、均衡地分配。

- **被选中的节点要减去 totalWeight，避免一直占优**：
    - 当某个节点被选中后，会把它的 currentWeight 减去所有节点权重之和 totalWeight。
    - 这样能防止同一个节点连续被选中过多次：它刚被选中时“消耗”了大量当前权重，自然就要让其他节点有机会（因为其他节点每轮都会持续加它们自己的权重）。

```go
package main

import (
	"fmt"
)

// WeightedItem 表示一个带有权重的元素
type WeightedItem struct {
	Value         string // 元素标识（比如服务器地址等）
	Weight        int    // 静态配置的权重
	currentWeight int    // 动态“当前权重”，用于平滑加权轮询
}

// WeightedRoundRobin 实现平滑加权轮询
type WeightedRoundRobin struct {
	items       []*WeightedItem // 所有待轮询的元素
	totalWeight int             // 所有元素的权重总和
}

// NewWeightedRoundRobin 用给定的元素初始化一个 WeightedRoundRobin
func NewWeightedRoundRobin(items []*WeightedItem) *WeightedRoundRobin {
	wrr := &WeightedRoundRobin{items: items}
	// 计算总权重
	for _, item := range items {
		wrr.totalWeight += item.Weight
	}
	return wrr
}

// Next 返回下一次要选中的元素
func (wrr *WeightedRoundRobin) Next() *WeightedItem {
	if len(wrr.items) == 0 {
		return nil
	}

	// 在循环开始前，selected 尚未指向任何元素，因此初始为 nil
	var selected *WeightedItem

	for _, item := range wrr.items {
		// 1. 先令每个 item 的 currentWeight += item.Weight
		//    这样能够让长时间未被选中的元素快速“补偿”权重，
		//    让它们有机会在下一次循环中脱颖而出
		item.currentWeight += item.Weight

		// 2. 判断是否需要更新 selected
		//    - 第一次循环，selected == nil 为真，selected 被赋值为第一个 item
		//    - 之后的循环，仅当当前 item 的 currentWeight > selected.currentWeight 时，
		//      才更新 selected，让 selected 始终指向 currentWeight 最大的元素
		if selected == nil || item.currentWeight > selected.currentWeight {
			selected = item
		}
	}

	// 3. 对被选中的元素减去总权重，以防止它在短期内再次获得过多的优势
	selected.currentWeight -= wrr.totalWeight

	return selected
}

func main() {
	// 准备一些测试数据
	items := []*WeightedItem{
		{Value: "A", Weight: 1},
		{Value: "B", Weight: 2},
		{Value: "C", Weight: 5},
	}

	// 初始化平滑加权轮询结构
	wrr := NewWeightedRoundRobin(items)

	// 模拟多次选取，统计每个元素被选中的次数
	count := make(map[string]int)
	for i := 0; i < 100; i++ {
		sel := wrr.Next()
		fmt.Print(sel.Value)
		count[sel.Value]++
	}

	// 打印分布结果
	fmt.Println("\nCount Distribution:", count)
}

// 输出结果
// CBCACCBCCBCACCBCCBCACCBCCBCACCBCCBCACCBCCBCACCBCCBCACCBCCBCACCBCCBCACCBCCBCACCBCCBCACCBCCBCACCBCCBCA
// Count Distribution: map[A:13 B:25 C:62]
```

## 最小连接数负载均衡

```go
package main

import (
	"container/list"
	"fmt"
	"math/rand"
	"sync"
	"time"
)

// Server 结构体
type Server struct {
	Address     string
	Connections int
}

// LoadBalancer 结构体
type LoadBalancer struct {
	servers        []*Server
	connectionMap  map[int]*list.List        // key: 连接数, value: 服务器链表
	serverNodes    map[*Server]*list.Element // 服务器到链表节点的映射
	minConnections int                       // 记录当前最小连接数
	mutex          sync.Mutex
}

// NewLoadBalancer 创建负载均衡器
func NewLoadBalancer(addresses []string) *LoadBalancer {
	lb := &LoadBalancer{
		servers:        make([]*Server, len(addresses)),
		connectionMap:  make(map[int]*list.List),
		serverNodes:    make(map[*Server]*list.Element),
		minConnections: 0,
	}

	for i, addr := range addresses {
		server := &Server{Address: addr, Connections: 0}
		lb.servers[i] = server

		// 初始化 connectionMap
		if lb.connectionMap[0] == nil {
			lb.connectionMap[0] = list.New()
		}
		lb.serverNodes[server] = lb.connectionMap[0].PushBack(server)
	}

	return lb
}

// GetLeastConnectionServer 获取最小连接数服务器
func (lb *LoadBalancer) GetLeastConnectionServer() *Server {
	lb.mutex.Lock()
	defer lb.mutex.Unlock()

	servers, exists := lb.connectionMap[lb.minConnections]
	if !exists || servers.Len() == 0 {
		return nil
	}

	element := servers.Front()
	server := element.Value.(*Server)

	fmt.Printf("Selected server: %s with %d connections\n", server.Address, server.Connections)

	lb.updateServerConnections(server, server.Connections+1)
	return server
}

// updateServerConnections 更新服务器连接数
func (lb *LoadBalancer) updateServerConnections(server *Server, newConnections int) {
	oldConnections := server.Connections
	server.Connections = newConnections

	if node, exists := lb.serverNodes[server]; exists {
		lb.connectionMap[oldConnections].Remove(node)
		if lb.connectionMap[oldConnections].Len() == 0 {
			delete(lb.connectionMap, oldConnections)

			// 更新 minConnections，确保不会一直选择相同的服务器
			if oldConnections == lb.minConnections {
				lb.minConnections = newConnections
				for conn := range lb.connectionMap {
					if conn < lb.minConnections {
						lb.minConnections = conn
					}
				}
			}
		}
	}

	if lb.connectionMap[newConnections] == nil {
		lb.connectionMap[newConnections] = list.New()
	}
	lb.serverNodes[server] = lb.connectionMap[newConnections].PushBack(server)
}

// ReleaseConnection 释放服务器连接
func (lb *LoadBalancer) ReleaseConnection(server *Server) {
	lb.mutex.Lock()
	defer lb.mutex.Unlock()
	fmt.Printf("Releasing connection on server: %s, current connections: %d\n", server.Address, server.Connections)
	lb.updateServerConnections(server, server.Connections-1)
}

// HandleRequest 处理请求
func (lb *LoadBalancer) HandleRequest() {
	server := lb.GetLeastConnectionServer()
	if server == nil {
		fmt.Println("No available servers")
		return
	}

	time.Sleep(time.Duration(rand.Intn(3)+1) * time.Second)
	lb.ReleaseConnection(server)
}

func main() {
	rand.Seed(time.Now().UnixNano())
	serverAddresses := []string{"192.168.1.1", "192.168.1.2", "192.168.1.3"}
	lb := NewLoadBalancer(serverAddresses)

	var wg sync.WaitGroup
	for i := 0; i < 50; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			lb.HandleRequest()
		}()
		time.Sleep(time.Millisecond * 500) // 避免所有请求瞬间涌入
	}

	wg.Wait()
}


// 输出结果
// Selected server: 192.168.1.1 with 0 connections
// Selected server: 192.168.1.2 with 0 connections
// Selected server: 192.168.1.3 with 0 connections
// Selected server: 192.168.1.1 with 1 connections
// Selected server: 192.168.1.2 with 1 connections
// Selected server: 192.168.1.3 with 1 connections
// Releasing connection on server: 192.168.1.2, current connections: 2
// Selected server: 192.168.1.1 with 2 connections
// Releasing connection on server: 192.168.1.2, current connections: 1
// Releasing connection on server: 192.168.1.1, current connections: 3
// Releasing connection on server: 192.168.1.3, current connections: 2
// Releasing connection on server: 192.168.1.1, current connections: 2
// Selected server: 192.168.1.2 with 0 connections
// Selected server: 192.168.1.3 with 1 connections
// Selected server: 192.168.1.1 with 1 connections
// Releasing connection on server: 192.168.1.3, current connections: 2
// Releasing connection on server: 192.168.1.1, current connections: 2
// Selected server: 192.168.1.2 with 1 connections
// Releasing connection on server: 192.168.1.1, current connections: 1
// Selected server: 192.168.1.3 with 1 connections
// Selected server: 192.168.1.1 with 0 connections
// Selected server: 192.168.1.1 with 1 connections
// Releasing connection on server: 192.168.1.2, current connections: 2
// Selected server: 192.168.1.3 with 2 connections
// Releasing connection on server: 192.168.1.3, current connections: 3
// Releasing connection on server: 192.168.1.2, current connections: 1
// Selected server: 192.168.1.1 with 2 connections
// Releasing connection on server: 192.168.1.3, current connections: 2
// Selected server: 192.168.1.2 with 0 connections
// Releasing connection on server: 192.168.1.3, current connections: 1
// Selected server: 192.168.1.2 with 1 connections
// Releasing connection on server: 192.168.1.1, current connections: 3
// Selected server: 192.168.1.3 with 0 connections
// Releasing connection on server: 192.168.1.1, current connections: 2
// Selected server: 192.168.1.3 with 1 connections
// Releasing connection on server: 192.168.1.1, current connections: 1
......
```

## 限流器

实现一个限流器，支持以下功能：

- 每秒最多允许 N 个请求通过。
- 如果请求超过限制，则拒绝请求或等待直到可以处理。

可以使用 time.Ticker 和 chan 来实现一个简单的限流器。

- 1. **RateLimiter 结构体**:
   - `rate`: 每秒允许的请求数。
   - `bucket`: 令牌桶，用于存放令牌。
   - `ticker`: 定时器，用于定期生成令牌。
   - `stopChan`: 用于停止限流器的信号。
- 2. **NewRateLimiter 函数**：创建一个新的限流器，并启动令牌生成器。
- 3. **tokenGenerator 方法**：定期生成令牌并放入令牌桶中。如果令牌桶已满，则丢弃令牌。
- 4. **Allow 方法**：检查是否允许请求通过。如果令牌桶中有令牌，则允许请求并返回 `true`，否则返回 `false`。
- 5. **Wait 方法**：等待直到令牌桶中有令牌，然后允许请求通过。
- 6. **Stop 方法**：停止限流器，停止令牌生成器。

```go
package main

import (
	"fmt"
	"time"
)

// RateLimiter 限流器结构体
type RateLimiter struct {
	rate     int           // 每秒允许的请求数
	bucket   chan struct{} // 令牌桶
	ticker   *time.Ticker  // 定时器
	stopChan chan struct{} // 停止信号
}

// NewRateLimiter 创建一个新的限流器
func NewRateLimiter(rate int, size int) *RateLimiter {
	rl := &RateLimiter{
		rate:     rate,
		bucket:   make(chan struct{}, size),
		ticker:   time.NewTicker(time.Second / time.Duration(rate)), // 计算出每个令牌生成的时间间隔
		stopChan: make(chan struct{}),
	}

	// 预先填充令牌桶
	for i := 0; i < size; i++ {
		rl.bucket <- struct{}{}
	}

	// 启动令牌生成器
	go rl.tokenGenerator()

	return rl
}

// tokenGenerator 令牌生成器
func (rl *RateLimiter) tokenGenerator() {
	for {
		select {
		case <-rl.ticker.C:
			select {
			case rl.bucket <- struct{}{}:
				// 成功放入令牌
			default:
				// 令牌桶已满，丢弃令牌
			}
		case <-rl.stopChan:
			rl.ticker.Stop()
			return
		}
	}
}

// Allow 检查是否允许请求通过
func (rl *RateLimiter) Allow() bool {
	select {
	case <-rl.bucket:
		return true
	default:
		return false
	}
}

// Wait 等待直到可以处理请求
func (rl *RateLimiter) Wait() {
	<-rl.bucket
}

// Stop 停止限流器
func (rl *RateLimiter) Stop() {
	close(rl.stopChan)
}

func main() {
	// 创建一个每秒允许 2 个请求的限流器，令牌桶大小为 3
	rl := NewRateLimiter(2, 3)

	// 模拟请求
	for i := 1; i <= 5; i++ {
		if rl.Allow() {
			fmt.Printf("Request %d allowed\n", i)
		} else {
			fmt.Printf("Request %d denied\n", i)
		}
		time.Sleep(200 * time.Millisecond)
	}

	// 再次模拟请求
	for i := 6; i <= 10; i++ {
		rl.Wait()
		fmt.Printf("Request %d allowed after wait\n", i)
	}

	// 停止限流器
	rl.Stop()
}

// 输出结果
// Request 1 allowed
// Request 2 allowed
// Request 3 allowed
// Request 4 allowed
// Request 5 denied
// Request 6 allowed after wait
// Request 7 allowed after wait
// Request 8 allowed after wait
// Request 9 allowed after wait
// Request 10 allowed after wait
```

## [355.设计推特](https://leetcode.cn/problems/design-twitter/description/)

设计一个简化版的推特(Twitter)，可以让用户实现发送推文，关注/取消关注其他用户，能够看见关注人（包括自己）的最近 10 条推文。

实现 Twitter 类：

- `Twitter()` 初始化简易版推特对象
- `void postTweet(int userId, int tweetId)` 根据给定的 tweetId 和 userId 创建一条新推文。每次调用此函数都会使用一个不同的 tweetId。
- `List<Integer> getNewsFeed(int userId)` 检索当前用户新闻推送中最近 10 条推文的 ID 。新闻推送中的每一项都必须是由用户关注的人或者是用户自己发布的推文。推文必须按照时间顺序由最近到最远排序。
- `void follow(int followerId, int followeeId)` ID 为 followerId 的用户开始关注 ID 为 followeeId 的用户。
- `void unfollow(int followerId, int followeeId)` ID 为 followerId 的用户不再关注 ID 为 followeeId 的用户。

```go
package main

import (
	"container/heap"
	"fmt"
)

// Twitter 结构体，模拟 Twitter 系统
type Twitter struct {
	timeStamp int                      // 全局时间戳，确保推文按时间顺序排列
	tweets    map[int][]Tweet          // 用户推文记录，key: 用户ID, value: 推文列表
	followees map[int]map[int]struct{} // 关注关系表，key: 用户ID, value: 关注的用户集合，followees 记录的是某个用户关注了哪些用户。
}

// Tweet 结构体，表示一条推文
type Tweet struct {
	id        int // 推文 ID
	timeStamp int // 发送时间戳
}

// TweetHeap 结构体，实现最小堆（按时间戳倒序）
type TweetHeap []Tweet

// 堆相关操作：实现 `heap.Interface`
func (h TweetHeap) Len() int           { return len(h) }
func (h TweetHeap) Less(i, j int) bool { return h[i].timeStamp > h[j].timeStamp } // 时间戳大的排前面
func (h TweetHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }

// Push 操作，将新推文加入堆
func (h *TweetHeap) Push(x interface{}) {
	*h = append(*h, x.(Tweet))
}

// Pop 操作，从堆中弹出最旧的推文
func (h *TweetHeap) Pop() interface{} {
	old := *h
	n := len(old)
	tweet := old[n-1] // 取最后一个元素（时间最早的）
	*h = old[:n-1]
	return tweet
}

// 构造函数，初始化 Twitter
func Constructor() Twitter {
	return Twitter{
		tweets:    make(map[int][]Tweet),
		followees: make(map[int]map[int]struct{}),
	}
}

// PostTweet 让用户 `userId` 发送一条推文 `tweetId`
func (this *Twitter) PostTweet(userId int, tweetId int) {
	this.timeStamp++ // 递增时间戳，确保推文顺序
	this.tweets[userId] = append(this.tweets[userId], Tweet{id: tweetId, timeStamp: this.timeStamp})
}

// GetNewsFeed 获取用户 `userId` 的最新推文（包含自己和关注的用户）
func (this *Twitter) GetNewsFeed(userId int) []int {
	h := &TweetHeap{}
	heap.Init(h)

	// 获取用户 `userId` 关注的所有用户（包括自己）
	users := this.followees[userId]
	if users == nil {
		users = make(map[int]struct{}) // 防止 `nil map` 赋值 panic
	}
	users[userId] = struct{}{} // 自己的推文也要加入

	// 遍历所有关注的用户，获取他们最近的推文
	for user := range users {
		tweets := this.tweets[user] // 获取用户的推文
		if len(tweets) > 0 {
			// 获取关注的用户的所有的推文
			for i := len(tweets) - 1; i >= 0; i-- {
				heap.Push(h, tweets[i])
			}
		}
	}

	// 取出最新的 10 条推文
	var res []int
	for len(*h) > 0 && len(res) < 10 {
		res = append(res, heap.Pop(h).(Tweet).id)
	}
	return res
}

// Follow 让 `followerId` 关注 `followeeId`
func (this *Twitter) Follow(followerId int, followeeId int) {
	// 如果 `followerId` 还没有关注别人，初始化 map
	if _, exists := this.followees[followerId]; !exists {
		this.followees[followerId] = make(map[int]struct{})
	}
	this.followees[followerId][followeeId] = struct{}{} // 关注 `followeeId`
}

// Unfollow 让 `followerId` 取消关注 `followeeId`
func (this *Twitter) Unfollow(followerId int, followeeId int) {
	if _, exists := this.followees[followerId]; exists {
		delete(this.followees[followerId], followeeId) // 取消关注
	}
}

// 测试代码
func main() {
	twitter := Constructor()

	// 用户 1 发送推文 5
	twitter.PostTweet(1, 5)
	fmt.Println(twitter.GetNewsFeed(1)) // 输出: [5]

	// 用户 1 关注用户 2
	twitter.Follow(1, 2)

	// 用户 2 发送推文 6
	twitter.PostTweet(2, 6)
	fmt.Println(twitter.GetNewsFeed(1)) // 输出: [6, 5]

	// 用户 1 取消关注用户 2
	twitter.Unfollow(1, 2)
	fmt.Println(twitter.GetNewsFeed(1)) // 输出: [5]
}
```