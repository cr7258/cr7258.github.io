package code

func lengthOfLongestSubstring(s string) int {
	dic := make(map[byte]int)
	n := len(s)
	res := 0
	i := -1
	for j := 0; j < n; j++ {
		if v, ok := dic[s[j]]; ok {
			i = max(v, i)
		}
		dic[s[j]] = j
		res = max(res, j-i)
	}
	return res
}

func max(x, y int) int {
	if x > y {
		return x
	}
	return y
}
