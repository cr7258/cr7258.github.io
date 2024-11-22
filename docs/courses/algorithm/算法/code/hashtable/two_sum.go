package hashtable

// 暴力解法
func twoSumBruteForce(nums []int, target int) []int {
	for i := 0; i < len(nums); i++ {
		for j := i + 1; j < len(nums); j++ {
			if nums[i]+nums[j] == target {
				return []int{i, j}
			}
		}
	}
	return nil
}

func twoSum(nums []int, target int) []int {
	// 键是数字，值是 nums 数组的下标
	hashTable := make(map[int]int)
	for i, v := range nums {
		// 在哈希表中查找的数字，target 减去当前的数字
		if p, ok := hashTable[target-v]; ok {
			return []int{p, i}
		}
		// 没有找到就把当前数字存入哈希表
		hashTable[v] = i
	}
	return nil
}
