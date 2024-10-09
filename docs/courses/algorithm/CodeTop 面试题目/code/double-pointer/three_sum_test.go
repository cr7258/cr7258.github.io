package double_pointer

import (
	"reflect"
	"testing"
)

func TestThreeSum(t *testing.T) {
	tests := []struct {
		nums []int
		want [][]int
	}{
		{[]int{-1, 0, 1, 2, -1, -4}, [][]int{{-1, -1, 2}, {-1, 0, 1}}},
	}
	for _, tt := range tests {
		got := threeSum(tt.nums)
		if !reflect.DeepEqual(got, tt.want) {
			t.Errorf("threeSum(%v) = %v; want %v", tt.nums, got, tt.want)
		}
	}
}
