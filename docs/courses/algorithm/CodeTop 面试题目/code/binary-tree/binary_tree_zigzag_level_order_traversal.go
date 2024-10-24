package binary_tree

func zigzagLevelOrder(root *TreeNode) [][]int {
	var ans [][]int
	if root == nil {
		return ans
	}

	queue := []*TreeNode{root}
	level := 1

	for len(queue) != 0 {
		var levelAns []int
		levelNum := len(queue)
		for i := 0; i < levelNum; i++ {
			node := queue[0]
			levelAns = append(levelAns, node.Val)
			queue = queue[1:]
			if node.Left != nil {
				queue = append(queue, node.Left)
			}
			if node.Right != nil {
				queue = append(queue, node.Right)
			}
		}

		// 偶数层将本层的结果翻转一下
		if level % 2 == 0 {
			n := len(levelAns)
			for i := 0; i < n/2; i++ {
				levelAns[i], levelAns[n-1-i] = levelAns[n-1-i], levelAns[i]
			}
		}
		ans = append(ans, levelAns)
		level++
	}
	return ans
}