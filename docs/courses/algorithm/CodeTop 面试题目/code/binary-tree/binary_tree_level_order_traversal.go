package binary_tree

func levelOrder(root *TreeNode) [][]int {
	// 存放最后的结果
	var ans [][]int
	// 特殊情况
	if root == nil {
		return ans
	}
	// 队列存放每层节点
	var queue []*TreeNode
	// 先将根节点加入队列
	queue = append(queue, root)
	// 外层循环控制从上向下一层层遍历
	for len(queue) != 0 {
		// 存放每层结果
		var levelAns []int
		// 该层的节点数
		curLevelNum := len(queue)
		// 内层循环控制每一层从左向右遍历
		for i := 0; i < curLevelNum; i++ {
			node := queue[0]
			levelAns = append(levelAns, node.Val)
			queue = queue[1:]
			// 将该层的子节点加入队列，在下一次层序遍历时使用
			if node.Left != nil {
				queue = append(queue, node.Left)
			}
			if node.Right != nil {
				queue = append(queue, node.Right)
			}
		}
		ans = append(ans, levelAns)
	}
	return ans
}
