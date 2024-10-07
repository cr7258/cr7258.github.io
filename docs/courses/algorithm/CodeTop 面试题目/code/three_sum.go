package code

import "sort"

func threeSum(nums []int) [][]int {
	n := len(nums)
	// 先将数组排序
	sort.Ints(nums)
	ans := make([][]int, 0)

	// 枚举 i
	for i := 0; i < n; i++ {
		// 需要和上一次枚举的数不相同
		if i > 0 && nums[i] == nums[i-1] {
			continue
		}
		// r 对应的指针初始指向数组的最右端
		r := n - 1
		target := -1 * nums[i]
		// 枚举 b
		for l := i + 1; l < n; l++ {
			// 需要和上一次枚举的数不相同
			if l > i+1 && nums[l] == nums[l-1] {
				continue
			}
			// 需要保证 l 的指针在 r 的指针的左侧
			for l < r && nums[l]+nums[r] > target {
				r--
			}
			// 如果指针重合，随着 l 后续的增加
			// 就不会有满足 i+l+r=0 并且 l<r，可以退出循环
			if l == r {
				break
			}
			if nums[l]+nums[r] == target {
				ans = append(ans, []int{nums[i], nums[l], nums[r]})
			}
		}
	}
	return ans
}
