package sort

func quickSortArray(nums []int) []int {
	quickSort(nums, 0, len(nums)-1)
	return nums
}

/* 哨兵划分 */
func partition(nums []int, left, right int) int {
	// 以 nums[left] 为基准数
	i, j := left, right
	for i < j {
		for i < j && nums[j] >= nums[left] {
			j-- // 从右向左找首个小于基准数的元素
		}
		for i < j && nums[i] <= nums[left] {
			i++ // 从左向右找首个大于基准数的元素
		}
		// 元素交换
		nums[i], nums[j] = nums[j], nums[i]
	}
	// 将基准数交换至两子数组的分界线
	nums[i], nums[left] = nums[left], nums[i]
	return i // 返回基准数的索引
}

/* 快速排序 */
func quickSort(nums []int, left, right int) {
	// 子数组长度为 1 时终止递归
	if left >= right {
		return
	}
	// 哨兵划分
	pivot := partition(nums, left, right)
	// 递归左子数组、右子数组
	quickSort(nums, left, pivot-1)
	quickSort(nums, pivot+1, right)
}
