package double_pointer

import (
	"reflect"
	"testing"
)

func TestMergeSortedArray(t *testing.T) {
	tests := []struct {
		nums1 []int
		m     int
		nums2 []int
		n     int
		want  []int
	}{
		{nums1: []int{1, 2, 3, 0, 0, 0}, m: 3, nums2: []int{2, 5, 6}, n: 3, want: []int{1, 2, 2, 3, 5, 6}},
		{nums1: []int{1}, m: 1, nums2: []int{}, n: 0, want: []int{1}},
	}

	for _, tt := range tests {
		merge(tt.nums1, tt.m, tt.nums2, tt.n)
		if !reflect.DeepEqual(tt.nums1, tt.want) {
			t.Errorf("merge(%v, %d, %v, %d) = %v; want %v", tt.nums1, tt.m, tt.nums2, tt.n, tt.nums1, tt.want)
		}
	}
}
