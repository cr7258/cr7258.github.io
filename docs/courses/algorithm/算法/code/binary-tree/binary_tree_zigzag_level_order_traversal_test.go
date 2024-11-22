package binary_tree

import (
	"reflect"
	"testing"
)

func TestZigzagLevelOrder(t *testing.T) {
	tests := []struct {
		root *TreeNode
		want [][]int
	}{
		{
			root: func() *TreeNode {
				l1 := &TreeNode{Val: 3}
				l2 := &TreeNode{Val: 9}
				l3 := &TreeNode{Val: 20}
				l4 := &TreeNode{Val: 15}
				l5 := &TreeNode{Val: 7}

				l1.Left = l2
				l1.Right = l3
				l3.Left = l4
				l3.Right = l5

				return l1
			}(),
			want: [][]int{{3}, {20, 9}, {15, 7}},
		},
	}

	for _, tt := range tests {
		got := zigzagLevelOrder(tt.root)
		if !reflect.DeepEqual(got, tt.want) {
			t.Errorf("zigzagLevelOrder(%v)=%v, want=%v", tt.root, got, tt)
		}
	}
}
