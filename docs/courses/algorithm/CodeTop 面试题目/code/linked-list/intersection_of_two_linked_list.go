package linked_list

func getIntersectionNode(headA, headB *ListNode) *ListNode {
	if headA == nil || headB == nil {
		return nil
	}

	curA, curB := headA, headB

	// 当 curA 和 curB 不相等时，继续遍历
	for curA != curB {
		// 如果 curA 走到了末尾，就切换到 headB；否则继续往下走
		if curA == nil {
			curA = headB
		} else {
			curA = curA.Next
		}

		// 如果 curB 走到了末尾，就切换到 headA；否则继续往下走
		if curB == nil {
			curB = headA
		} else {
			curB = curB.Next
		}
	}

	// 当 curA == curB 时返回交点，或者返回 nil
	return curA
}
