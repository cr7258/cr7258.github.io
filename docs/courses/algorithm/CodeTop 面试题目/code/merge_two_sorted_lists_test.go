package code

import "testing"

func TestMergeTwoLists(t *testing.T) {
	tests := []struct {
		list1 *ListNode
		list2 *ListNode
		want  *ListNode
	}{
		{
			list1: func() *ListNode {
				l1 := &ListNode{Val: 1}
				l2 := &ListNode{Val: 2}
				l3 := &ListNode{Val: 4}
				l1.Next = l2
				l2.Next = l3
				return l1
			}(),
			list2: func() *ListNode {
				l1 := &ListNode{Val: 1}
				l2 := &ListNode{Val: 3}
				l3 := &ListNode{Val: 4}
				l1.Next = l2
				l2.Next = l3
				return l1
			}(),
			want: func() *ListNode {
				l1 := &ListNode{Val: 1}
				l2 := &ListNode{Val: 1}
				l3 := &ListNode{Val: 2}
				l4 := &ListNode{Val: 3}
				l5 := &ListNode{Val: 4}
				l6 := &ListNode{Val: 4}
				l1.Next = l2
				l2.Next = l3
				l3.Next = l4
				l4.Next = l5
				l5.Next = l6
				return l1
			}(),
		},
	}

	for _, tt := range tests {
		got := mergeTwoLists(tt.list1, tt.list2)
		for got != nil && tt.want != nil {
			if got.Val != tt.want.Val {
				t.Errorf("mergeTwoLists(%v, %v) = %v; want %v", tt.list1, tt.list2, got, tt.want)
			}
			got = got.Next
			tt.want = tt.want.Next
		}
	}
}
