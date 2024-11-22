package double_pointer

func merge(nums1 []int, m int, nums2 []int, n int) {
	i1 := m - 1
	i2 := n - 1
	tail := m + n - 1
	for i1 >= 0 || i2 >= 0 {
		// nums1 数组已经遍历完成，直接将 nums2 数组的值进行追加
		if i1 == -1 {
			nums1[tail] = nums2[i2]
			i2--
		} else if i2 == -1 { // nums2 数组已经遍历完成，直接将 nums1 数组的值进行追加
			nums1[tail] = nums1[i1]
			i1--
		} else if nums1[i1] >= nums2[i2] {
			nums1[tail] = nums1[i1]
			i1--
		} else {
			nums1[tail] = nums2[i2]
			i2--
		}
		tail--
	}
}
