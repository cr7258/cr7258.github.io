package linked_list

import "testing"

func TestReverseKGroup(t *testing.T) {
	tests := []struct {
		head *ListNode
		k    int
		want *ListNode
	}{
		{
			k: 2,
			head: func() *ListNode {
				l1 := &ListNode{Val: 1}
				l2 := &ListNode{Val: 2}
				l3 := &ListNode{Val: 3}
				l4 := &ListNode{Val: 4}
				l5 := &ListNode{Val: 5}
				l1.Next = l2
				l2.Next = l3
				l3.Next = l4
				l4.Next = l5
				return l1
			}(),
			want: func() *ListNode {
				l1 := &ListNode{Val: 2}
				l2 := &ListNode{Val: 1}
				l3 := &ListNode{Val: 4}
				l4 := &ListNode{Val: 3}
				l5 := &ListNode{Val: 5}
				l1.Next = l2
				l2.Next = l3
				l3.Next = l4
				l4.Next = l5
				return l1
			}(),
		},
	}

	for _, tt := range tests {
		got := reverseKGroup(tt.head, tt.k)
		for got != nil {
			if got.Val != tt.want.Val {
				t.Errorf("got = %v, want = %v", got.Val, tt.want.Val)
			}
			got = got.Next
			tt.want = tt.want.Next
		}
	}
}
