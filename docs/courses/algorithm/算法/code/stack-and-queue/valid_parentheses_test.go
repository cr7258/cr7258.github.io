package stack_and_queue

import "testing"

func TestIsValid(t *testing.T) {
	test := []struct {
		s    string
		want bool
	}{
		{"()", true},
		{"()[]{}", true},
		{"(]", false},
		{"([)]", false},
	}

	for _, tt := range test {
		got := isValid(tt.s)
		if got != tt.want {
			t.Errorf("isValid(%s) = %v; want %v", tt.s, got, tt.want)
		}
	}
}
