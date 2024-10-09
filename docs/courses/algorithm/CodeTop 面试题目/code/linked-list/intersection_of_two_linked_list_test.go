package linked_list

import "testing"

func TestGetIntersectionNode(t *testing.T) {
	tests := []struct {
		headA *ListNode
		headB *ListNode
	}{
		{
			headA: func() *ListNode {
				node1 := &ListNode{Val: 4}
				node2 := &ListNode{Val: 1}
				node3 := &ListNode{Val: 8}
				node4 := &ListNode{Val: 4}
				node5 := &ListNode{Val: 5}
				node1.Next = node2
				node2.Next = node3
				node3.Next = node4
				node4.Next = node5
				return node1
			}(),
		},
	}

	for _, tt := range tests {
		got := getIntersectionNode(tt.headA, tt.headB)
		if got != nil {
			t.Errorf("getIntersectionNode(%v, %v) = %v; want nil", tt.headA, tt.headB, got)
		}
	}
}
