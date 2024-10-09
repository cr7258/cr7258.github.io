package double_pointer

import "testing"

func TestLengthOfLongestSubstring(t *testing.T) {
	tests := []struct {
		s    string
		want int
	}{
		{"abcabcbb", 3},
		{"bbbbb", 1},
		{"pwwkew", 3},
	}

	for _, tt := range tests {
		got := lengthOfLongestSubstring(tt.s)
		if got != tt.want {
			t.Errorf("lengthOfLongestSubstring(%v) = %v; want %v", tt.s, got, tt.want)
		}
	}
}
