package linked_list

import "testing"

func TestHasCycle(t *testing.T) {
	head := &ListNode{Val: 3}
	node2 := &ListNode{Val: 2}
	node0 := &ListNode{Val: 0}
	node4 := &ListNode{Val: 4}
	head.Next = node2
	node2.Next = node0
	node0.Next = node4
	node4.Next = node2
	if got := hasCycle(head); !got {
		t.Errorf("hasCycle(%v) = %v; want true", head, got)
	}
}
