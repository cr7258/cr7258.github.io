package binary_tree

import "testing"

func TestLowestCommonAncestor(t *testing.T) {
	// 构建测试用例的二叉树
	//         3
	//        / \
	//       5   1
	//      / \ / \
	//     6  2 0  8
	//       / \
	//      7   4

	node3 := &TreeNode{Val: 3}
	node5 := &TreeNode{Val: 5}
	node1 := &TreeNode{Val: 1}
	node6 := &TreeNode{Val: 6}
	node2 := &TreeNode{Val: 2}
	node0 := &TreeNode{Val: 0}
	node8 := &TreeNode{Val: 8}
	node7 := &TreeNode{Val: 7}
	node4 := &TreeNode{Val: 4}

	// 构建树的结构
	node3.Left = node5
	node3.Right = node1
	node5.Left = node6
	node5.Right = node2
	node1.Left = node0
	node1.Right = node8
	node2.Left = node7
	node2.Right = node4

	tests := []struct {
		p, q *TreeNode
		want *TreeNode
	}{
		{node5, node1, node3}, // 5 和 1 的最近公共祖先是 3
		{node5, node4, node5}, // 5 和 4 的最近公共祖先是 5
		{node6, node7, node5}, // 6 和 7 的最近公共祖先是 2
		{node5, node2, node5}, // 5 和 2 的最近公共祖先是 5
		{node0, node8, node1}, // 0 和 8 的最近公共祖先是 1
	}

	for _, tt := range tests {
		t.Run("", func(t *testing.T) {
			result := lowestCommonAncestor(node3, tt.p, tt.q)
			if result != tt.want {
				t.Errorf("expected %v, got %v", tt.want.Val, result.Val)
			}
		})
	}
}
