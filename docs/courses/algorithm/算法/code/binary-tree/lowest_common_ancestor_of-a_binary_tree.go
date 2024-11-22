package binary_tree

func lowestCommonAncestor(root, p, q *TreeNode) *TreeNode {
	if root == nil {
		return nil
	}
	if root == p || root == q {
		return root
	}

	left := lowestCommonAncestor(root.Left, p, q)
	right := lowestCommonAncestor(root.Right, p, q)
	// 情况 1：p 和 q 都在以 root 为根的树中，找到最近公共祖先
	if left != nil && right != nil {
		return root
	}
	// 情况 2：p 和 q 都不在以 root 为根的树中
	if left == nil && right == nil {
		return nil
	}
	// 情况 3：p 和 q 其中一个在 root 为根的树中，或者 p,q 两节点都在 root 为根的树中
	if left == nil {
		return right
	}
	return left
}
