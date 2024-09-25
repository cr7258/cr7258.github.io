---
title: 链表
author: Se7en
categories:
  - Algorithm
tags:
  - Algorithm
  - Linked List
---

## 图书整理 I

书店店员有一张链表形式的书单，每个节点代表一本书，节点中的值表示书的编号。为更方便整理书架，店员需要将书单倒过来排列，就可以从最后一本书开始整理，逐一将书放回到书架上。请倒序返回这个书单链表。

示例 1：

```bash
输入：head = [3,6,4,1]

输出：[1,4,6,3]
```

### 方法一：递归

利用递归，先递推至链表末端；回溯时，依次将节点值加入列表，即可实现链表值的倒序输出。

- 终止条件： 当 head == None 时，代表越过了链表尾节点，则返回空列表；
- 递推工作： 访问下一节点 head.next ；

```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */

func reverseBookList(head *ListNode) []int {
    var data []int
    recur(head, &data)
    return data
}

func recur(head *ListNode, data *[]int) {
    if head == nil {
      return
    }
    recur(head.Next, data)
    *data = append(*data, head.Val) 
}
```

### 方法二：辅助栈法

- 入栈： 遍历链表，将各节点值 push 入栈。
- 出栈： 将各节点值 pop 出栈，存储于数组并返回。

```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */

func reverseBookList(head *ListNode) []int {
    stack := list.New()
    for head != nil {
        stack.PushBack(head.Val)
        head = head.Next
    }
    data := make([]int, 0)
    for stack.Len() > 0 {
        data = append(data, stack.Back().Value.(int))
        stack.Remove(stack.Back())
    }
    return data
}
```

### 方法三：反转链表

先将原链表反转，然后再遍历反转后的链表，将值依次存入数组中。

```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */

func reverseBookList(head *ListNode) []int {
    var data []int
	reverseHead := reverseList(head)
	for reverseHead != nil {
		data = append(data, reverseHead.Val)
		reverseHead = reverseHead.Next
	}
	return data
}

func reverseList(head *ListNode) *ListNode {
	var pre *ListNode
	for head != nil {
		next := head.Next
		head.Next = pre
		pre = head
		head = next
	}
	return pre
}
```
