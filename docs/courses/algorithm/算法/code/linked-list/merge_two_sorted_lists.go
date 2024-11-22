package linked_list

func mergeTwoLists(list1 *ListNode, list2 *ListNode) *ListNode {
	// 用哨兵节点简化代码逻辑
	newHead := &ListNode{}
	cur := newHead
	for list1 != nil && list2 != nil {
		// 把 list1 加到新链表中
		if list1.Val <= list2.Val {
			cur.Next = list1
			list1 = list1.Next
			// 把 list2 加到新链表中
		} else {
			cur.Next = list2
			list2 = list2.Next
		}
		cur = cur.Next
	}

	// 拼接剩余链表
	if list1 == nil {
		cur.Next = list2
	} else {
		cur.Next = list1
	}

	return newHead.Next
}
