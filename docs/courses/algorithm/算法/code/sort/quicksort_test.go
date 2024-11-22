package sort

import (
	"reflect"
	"testing"
)

func TestQuickSortArray(t *testing.T) {
	nums := []int{3, 2, 1, 5, 6, 4}
	expected := []int{1, 2, 3, 4, 5, 6}
	if res := quickSortArray(nums); !reflect.DeepEqual(res, expected) {
		t.Errorf("expected %v, got %v", expected, res)
	}
}
