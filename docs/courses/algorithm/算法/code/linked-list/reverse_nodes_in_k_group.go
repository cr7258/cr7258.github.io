package linked_list

func reverseKGroup(head *ListNode, k int) *ListNode {
	// 创建一个虚拟节点 hair，并将其 Next 指向 head。这样可以方便处理头节点的特殊情况，最后返回 hair.Next 即可
	hair := &ListNode{Next: head}
	// pre 指向待翻转的一组子链表的头节点
	pre := hair

	for head != nil {
		// tail 用于找到当前 k 个节点的尾节点
		tail := pre
		// 循环处理链表，每次处理 k 个节点
		for i := 0; i < k; i++ {
			tail = tail.Next
			// 如果剩余节点数不足 k 个，不翻转直接返回
			if tail == nil {
				return hair.Next
			}
		}

		// 保存下一组的头节点
		nex := tail.Next
		// 翻转当前 k 个节点，并返回新的头尾节点
		head, tail = myReverse(head, tail)
		// 将翻转后的头节点接到上一组
		pre.Next = head
		// 更新 pre 为当前组的尾节点
		pre = tail
		// 移动 head 到下一组的头节点
		head = nex

	}
	return hair.Next
}

func myReverse(head, tail *ListNode) (*ListNode, *ListNode) {
	// pre 初始指向下一组的头节点
	pre := tail.Next
	// p 指向当前要处理的节点
	p := head
	// 循环翻转节点，直到处理完 tail
	for pre != tail {
		// 保存下一个要处理的节点
		nex := p.Next
		// 翻转当前节点的指针
		p.Next = pre
		// 更新 pre 为当前节点
		pre = p
		// 移动 p 到下一个节点，继续反转
		p = nex
	}
	// 返回翻转后的新头尾节点
	return tail, head
}
