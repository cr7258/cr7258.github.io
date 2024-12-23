---
title: 算法解题套路框架
author: Se7en
categories:
  - Algorithm
tags:
  - Algorithm
---

# 算法解题套路框架

## 滑动窗口算法

滑动窗口算法技巧主要用来解决子数组问题，比如让你寻找符合某个条件的最长/最短子数组。

### 模板

框架中两处 `...` 表示的更新窗口数据的地方，在具体的题目中，你需要做的就是往这里面填代码逻辑。而且，这两个 `...` 处的操作分别是扩大和缩小窗口的更新操作，等会你会发现它们操作是完全对称的。


```go
// 滑动窗口算法伪码框架
func slidingWindow(s string) {
    // 用合适的数据结构记录窗口中的数据，根据具体场景变通
    // 比如说，我想记录窗口中元素出现的次数，就用 map
    // 如果我想记录窗口中的元素和，就可以只用一个 int
    var window = ...

    left, right := 0, 0
    for right < len(s) {
        // c 是将移入窗口的字符
        c := s[right]
        window[c]++
        // 增大窗口
        right++
        // 进行窗口内数据的一系列更新
        ...

        // *** debug 输出的位置 ***
        // 注意在最终的解法代码中不要 print
        // 因为 IO 操作很耗时，可能导致超时
        fmt.Println("window: [",left,", ",right,")")
        // ***********************

        // 判断左侧窗口是否要收缩
        for left < right && window needs shrink { //replace "window needs shrink" with actual condition
            // d 是将移出窗口的字符
            d := s[left]
            window[d]--
            // 缩小窗口
            left++
            // 进行窗口内数据的一系列更新
            ...
        }
    }
}
```

### 例题

| 力扣 | 难度 |
|------|------|
| [438.找到字符串中所有字母异位词](https://leetcode.cn/problems/find-all-anagrams-in-a-string/description/) | 🟡 |
| [567.字符串的排列](https://leetcode.cn/problems/permutation-in-string/description/) | 🟡 |
| [3.无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/description/) | 🟡 |
| [76.最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/description/) | 🔴 |

#### 76.最小覆盖子串

给你一个字符串 s、一个字符串 t。返回 s 中涵盖 t 所有字符的最小子串。如果 s 中不存在涵盖 t 所有字符的子串，则返回空字符串 ""。

注意：

- 对于 t 中重复字符，我们寻找的子字符串中该字符数量必须不少于 t 中该字符数量。
- 如果 s 中存在这样的子串，我们保证它是唯一的答案。
 
示例 1：

```go
输入：s = "ADOBECODEBANC", t = "ABC"
输出："BANC"
解释：最小覆盖子串 "BANC" 包含来自字符串 t 的 'A'、'B' 和 'C'。
```


```go
func minWindow(s string, t string) string {
    // need 记录目标字符串中每个字符出现的次数
    // window 记录滑动窗口中相应字符出现的次数
    need, window := make(map[byte]int), make(map[byte]int)
    for i := range t {
        need[t[i]]++
    }

    left, right := 0, 0
    valid := 0
    // 记录最小覆盖子串的起始索引及长度
    start, length := 0, math.MaxInt32
    for right < len(s) {
        // c 是将移入窗口的字符
        c := s[right]
        // 扩大窗口
        right++
        // 进行窗口内数据的一系列更新
        if _, ok := need[c]; ok {
            window[c]++
            if window[c] == need[c] {
                valid++
            }
        }

        // 判断左侧窗口是否要收缩
        for valid == len(need) {
            // 在这里更新最小覆盖子串
            if right - left < length {
                start = left
                length = right - left
            }
            // d 是将移出窗口的字符
            d := s[left]
            // 缩小窗口
            left++
            // 进行窗口内数据的一系列更新
            if _, ok := need[d]; ok {
                if window[d] == need[d] {
                    valid--
                }
                window[d]--
            }
        }
    }
    // 返回最小覆盖子串
    if length == math.MaxInt32 {
        return ""
    }
    return s[start : start+length]
}
```

#### 567.字符串的排列

给你两个字符串 s1 和 s2 ，写一个函数来判断 s2 是否包含 s1 的排列。如果是，返回 true；否则，返回 false。

换句话说，s1 的排列之一是 s2 的子串 。

示例 1：

```go
输入：s1 = "ab" s2 = "eidbaooo"
输出：true
解释：s2 包含 s1 的排列之一 ("ba").
```

示例 2：

```go
输入：s1= "ab" s2 = "eidboaoo"
输出：false
```

提示：

- 1 <= s1.length, s2.length <= 104
- s1 和 s2 仅包含小写字母

这种题目，是明显的滑动窗口算法，相当给你一个 s 和一个 t，请问你 s 中是否存在一个子串，包含 t 中所有字符且不包含其他字符。

```go
// 判断 s 中是否存在 t 的排列
func checkInclusion(t string, s string) bool {
	need := make(map[byte]int)
	window := make(map[byte]int)

	for c := range t {
		need[t[c]]++
	}

	left, right := 0, 0
	valid := 0
	for right < len(s) {
		c := s[right]
		right++
        // 进行窗口内数据的一系列更新
		if _, ok := need[c]; ok {
			window[c]++
			if window[c] == need[c] {
				valid++
			}
		}

        // 判断左侧窗口是否要收缩
        // 窗口长度等于 t 时，左侧指针 left 会收缩窗口，保证窗口中没有多余字符
		for right-left == len(t) {
            // 在这里判断是否找到了合法的子串
			if valid == len(need) {
				return true
			}
			d := s[left]
			left++
            // 进行窗口内数据的一系列更新
			if _, ok := need[d]; ok {
				if window[d] == need[d] {
					valid--
				}
				window[d]--
			}
		}
	}
    // 未找到符合条件的子串
	return false
}
```

#### 438.找到字符串中所有字母异位词

给定两个字符串 s 和 p，找到 s 中所有 p 的异位词的子串，返回这些子串的起始索引。不考虑答案输出的顺序。

示例 1:

```go
输入: s = "cbaebabacd", p = "abc"
输出: [0,6]
解释:
起始索引等于 0 的子串是 "cba", 它是 "abc" 的异位词。
起始索引等于 6 的子串是 "bac", 它是 "abc" 的异位词。
```

这个所谓的字母异位词，不就是排列吗，搞个高端的说法就能糊弄人了吗？相当于，输入一个串 s，一个串 p，找到 s 中所有 p 的排列，返回它们的起始索引。

```go
func findAnagrams(s string, p string) []int {
    // 记录结果
	ans := []int{}
	need := make(map[byte]int)
	window := make(map[byte]int)

	for i := range p {
		need[p[i]]++
	}

	left, right := 0, 0
	valid := 0

	for right < len(s) {
		c := s[right]
		right++
        // 进行窗口内数据的一系列更新
		if _, ok := need[c]; ok {
			window[c]++
			if window[c] == need[c] {
				valid++
			}
		}

        // 判断左侧窗口是否要收缩
        // 保证窗口长度始终和 p 的长度一致
		for right-left == len(p) {
            // 当窗口符合条件时，把起始索引加入 res
			if valid == len(need) {
				ans = append(ans, left)
			}

			d := s[left]
			left++
            // 进行窗口内数据的一系列更新
			if _, ok := need[d]; ok {
				if window[d] == need[d] {
					valid--
				}
				window[d]--
			}
		}
	}
	return ans
}
```

#### 4.最长无重复子串

给定一个字符串 s，请你找出其中不含有重复字符的最长子串的长度。

示例 1:

```go
输入: s = "abcabcbb"
输出: 3 
解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。
```

这个题终于有了点新意，不是一套框架就出答案，不过反而更简单了，稍微改一改框架就行了：
- 这就是变简单了，连 need 和 valid 都不需要，而且更新窗口内数据也只需要简单的更新计数器 window 即可。
- 当 window[c] 值大于 1 时，说明窗口中存在重复字符，不符合条件，就该移动 left 缩小窗口了嘛。

```go
func lengthOfLongestSubstring(s string) int {
	window := make(map[byte]int)
	left, right := 0, 0
	// 记录结果
	res := 0

	for right < len(s) {
		c := s[right]
		right++
		// 进行窗口内数据的一系列更新
		window[c] = window[c] + 1

		// 判断左侧窗口是否要收缩
		for window[c] > 1 {
			d := s[left]
			left++

			// 进行窗口内数据的一系列更新
			window[d] = window[d] - 1
		}

		// 在这里更新答案
		if res < right-left {
			res = right - left
		}
	}
	return res
}
```