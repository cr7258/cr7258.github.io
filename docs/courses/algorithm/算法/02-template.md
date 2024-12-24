---
title: 算法解题套路框架
author: Se7en
categories:
  - Algorithm
tags:
  - Algorithm
---

# 算法解题套路框架

## 二分查找

### 模板

- 1.分析二分查找代码时，不要出现 else，全部展开成 else if 方便理解。把逻辑写对之后再合并分支，提升运行效率。
- 2.注意「搜索区间」和 while 的终止条件，如果存在漏掉的元素，记得在最后检查。
- 3.如果将「搜索区间」全都统一成两端都闭，好记，只要稍改 nums[mid] == target 条件处的代码和返回的逻辑即可，推荐拿小本本记下，作为二分搜索模板。

```go
// 基本二分查找
func binarySearch(nums []int, target int) int {
    left, right := 0, len(nums)-1
    for left <= right {
        mid := left + (right - left) / 2
        if nums[mid] < target {
            left = mid + 1
        } else if nums[mid] > target {
            right = mid - 1
        } else if nums[mid] == target {
            // 直接返回
            return mid
        }
    }
    // 直接返回
    return -1
}

// 寻找左边界的二分查找
func leftBound(nums []int, target int) int {
    left, right := 0, len(nums)-1
    for left <= right {
        mid := left + (right - left) / 2
        if nums[mid] < target {
            left = mid + 1
        } else if nums[mid] > target {
            right = mid - 1
        } else if nums[mid] == target {
            // 别返回，锁定左侧边界
            right = mid - 1
        }
    }
    // 判断 target 是否存在于 nums 中
    if left < 0 || left >= len(nums) {
        return -1
    }
    // 判断一下 nums[left] 是不是 target
    if nums[left] == target {
        return left
    }
    return -1
}

// 寻找右边界的二分查找
func rightBound(nums []int, target int) int {
    left, right := 0, len(nums)-1
    for left <= right {
        mid := left + (right - left) / 2
        if nums[mid] < target {
            left = mid + 1
        } else if nums[mid] > target {
            right = mid - 1
        } else if nums[mid] == target {
            // 别返回，锁定右侧边界
            left = mid + 1
        }
    }
    
    if right < 0 || right >= len(nums) {
        return -1
    }
    if nums[right] == target {
        return right
    }
    return -1
}
```

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

## 回溯

### 模板

无论是排列、组合还是子集问题，简单说无非就是让你从序列 nums 中以给定规则取若干元素，主要有以下几种变体：

- **1.元素无重不可复选**，即 nums 中的元素都是唯一的，每个元素最多只能被使用一次，这也是最基本的形式。以组合为例，如果输入 nums = [2,3,6,7]，和为 7 的组合应该只有 [7]。

```go
// 组合/子集问题回溯算法框架 
func backtrack(nums []int, start int) {
    // 回溯算法标准框架 
    for i := start; i < len(nums); i++ {
        // 做选择
        track = append(track, nums[i])
        // 注意参数 
        backtrack(nums, i+1)
        // 撤销选择 
        track = track[:len(track)-1]
    }
}

// 排列问题回溯算法框架
func backtrack(nums []int) {
    for i := 0; i < len(nums); i++ {
        // 剪枝逻辑 
        if used[i] {
            continue
        }
        // 做选择 
        used[i] = true
        track = append(track, nums[i])

        backtrack(nums)
        // 撤销选择 
        track = track[:len(track)-1]
        used[i] = false
    }
}
```

- **2.元素可重不可复选**，即 nums 中的元素可以存在重复，每个元素最多只能被使用一次。以组合为例，如果输入 nums = [2,5,2,1,2]，和为 7 的组合应该有两种 [2,2,2,1] 和 [5,2]。

```go
sort.Ints(nums)
// 组合/子集问题回溯算法框架
func backtrack(nums []int, start int) {
    // 回溯算法标准框架
    for i := start; i < len(nums); i++ {
        // 剪枝逻辑，跳过值相同的相邻树枝
        if i > start && nums[i] == nums[i-1] {
            continue
        }
        // 做选择
        track = append(track, nums[i])
        // 注意参数
        backtrack(nums, i+1)
        // 撤销选择
        track = track[:len(track)-1]
    }
}


sort.Ints(nums)
// 排列问题回溯算法框架
func backtrack(nums []int) {
    for i := 0; i < len(nums); i++ {
        // 剪枝逻辑
        if used[i] {
            continue
        }
        // 剪枝逻辑，固定相同的元素在排列中的相对位置
        if i > 0 && nums[i] == nums[i-1] && !used[i-1] {
            continue
        }
        // 做选择
        used[i] = true
        track = append(track, nums[i])

        backtrack(nums)

        // 撤销选择
        track = track[:len(track)-1]
        used[i] = false
    }
}
```

- **3.元素无重可复选**，即 nums 中的元素都是唯一的，每个元素可以被使用若干次。以组合为例，如果输入 nums = [2,3,6,7]，和为 7 的组合应该有两种 [2,2,3] 和 [7]。

```go
// 组合/子集问题回溯算法框架
func backtrack(nums []int, start int) {
    // 回溯算法标准框架
    for i := start; i < len(nums); i++ {
        // 做选择
        track = append(track, nums[i])
        // 注意参数
        backtrack(nums, i)
        // 撤销选择
        track = track[:len(track)-1]
    }
}

// 排列问题回溯算法框架
func backtrack(nums []int) {
    for i := 0; i < len(nums); i++ {
        // 做选择
        track = append(track, nums[i])
        backtrack(nums)
        // 撤销选择
        track = track[:len(track)-1]
    }
}
```

### 例题

| 力扣                                                              | 难度 | 类型 |
|--------------------------------------------------------------------------------------------------|------| ----- |
| [78.子集](https://leetcode.cn/problems/subsets/)                                                  | 🟠   | 子集（元素无重不可复选） |
| [77.组合](https://leetcode.cn/problems/combinations/)                                             | 🟠   |组合（元素无重不可复选） |
| [216.组合总和 III](https://leetcode.cn/problems/combination-sum-iii/)                              | 🟠   | 组合（元素无重不可复选） |
| [46.全排列](https://leetcode.cn/problems/permutations/)                                           | 🟠   | 排列（元素无重不可复选） |
| [90.子集 II](https://leetcode.cn/problems/subsets-ii/)                                            | 🟠   | 子集（元素可重不可复选） |
| [40.组合总和 II](https://leetcode.cn/problems/combination-sum-ii/)                                 | 🟠   | 组合（元素可重不可复选） |
| [47.全排列 II](https://leetcode.cn/problems/permutations-ii/)                                     | 🟠   | 排列（元素可重不可复选） |
| [39.组合总和](https://leetcode.cn/problems/combination-sum/)                                       | 🟠   | 组合（元素无重可复选） |
| [22. 括号生成](https://leetcode.cn/problems/generate-parentheses/)                                 | 🟠   |  |
| [698. 划分为k个相等的子集](https://leetcode.cn/problems/partition-to-k-equal-sum-subsets/)         | 🟠   |  |


#### 90.子集 II（元素无重不可复选）

给你一个整数数组 nums ，数组中的元素互不相同 。返回该数组所有可能的子集（幂集）。

解集不能包含重复的子集。你可以按任意顺序返回解集。

示例 1：

```go
输入：nums = [1,2,3]
输出：[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]
```

我们使用 `start` 参数控制树枝的生长避免产生重复的子集，用 `track` 记录根节点到每个节点的路径的值，同时在前序位置把每个节点的路径值收集起来，完成回溯树的遍历就收集了所有子集。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202412241600542.png)

```go
func subsets(nums []int) [][]int {
    var res [][]int
    // 记录回溯算法的递归路径
    var track []int
    
    // 回溯算法核心函数，遍历子集问题的回溯树
    var backtrack func(int)
    backtrack = func(start int) {
        // 前序位置，每个节点的值都是一个子集
        res = append(res, append([]int(nil), track...))
        
        // 回溯算法标准框架
        for i := start; i < len(nums); i++ {
            // 做选择
            track = append(track, nums[i])
            // 通过 start 参数控制树枝的遍历，避免产生重复的子集
            backtrack(i + 1)
            // 撤销选择
            track = track[:len(track)-1]
        }
    }

    backtrack(0)
    return res
}
```

#### 77.组合（元素无重不可复选）

给定两个整数 n 和 k，返回范围 [1, n] 中所有可能的 k 个数的组合。

你可以按任何顺序返回答案。

示例 1：

```go
输入：n = 4, k = 2
输出：
[
  [2,4],
  [3,4],
  [2,3],
  [1,2],
  [1,3],
  [1,4],
]
```

这是标准的组合问题，但我给你翻译一下就变成子集问题了：

给你输入一个数组 nums = [1,2..,n] 和一个正整数 k，请你生成所有大小为 k 的子集。

还是以 nums = [1,2,3] 为例，刚才让你求所有子集，就是把所有节点的值都收集起来；现在你只需要把第 2 层（根节点视为第 0 层）的节点收集起来，就是大小为 2 的所有组合：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202412241604224.png)

反映到代码上，只需要稍改 base case，控制算法仅仅收集第 k 层节点的值即可：

```go
func combine(n int, k int) [][]int {
    var res [][]int
    // 记录回溯算法的递归路径
    var track []int

    // 回溯算法核心函数
    var backtrack func(int)
    backtrack = func(start int) {
        // base case
        if k == len(track) {
            // 遍历到了第 k 层，收集当前节点的值
            res = append(res, append([]int(nil), track...))
            return
        }

        // 回溯算法标准框架
        for i := start; i <= n; i++ {
            // 选择
            track = append(track, i)
            // 通过 start 参数控制树枝的遍历，避免产生重复的子集
            backtrack(i + 1)
            // 撤销选择
            track = track[:len(track)-1]
        }
    }

    backtrack(1)
    return res
}
```

#### 216.组合总和 III（元素无重不可复选）

找出所有相加之和为 n 的 k 个数的组合，且满足下列条件：

- 只使用数字1到9
- 每个数字 最多使用一次 

返回所有可能的有效组合的列表。该列表不能包含相同的组合两次，组合可以以任何顺序返回。

示例 1:

```go
输入: k = 3, n = 7
输出: [[1,2,4]]
解释:
1 + 2 + 4 = 7
没有其他符合的组合了。
```

```go
func combinationSum3(k int, n int) [][]int {
	var res [][]int
	var track []int
	var trackSum int

	var backtrack func(int)
	backtrack = func(start int) {
        // 当满足条件时，收集 track 的值
		if k == len(track) && trackSum == n {
			res = append(res, append([]int(nil), track...))
		}

		if trackSum > n || len(track) > k {
			return
		}

        // 从 start 开始遍历到 9（只能使用数字 1-9）
		for i := start; i <= 9; i++ {
			trackSum += i
			track = append(track, i)
			backtrack(i + 1)
			track = track[:len(track)-1]
			trackSum -= i
		}
	}

	backtrack(1)
	return res
}
```

#### 46.全排列（元素无重不可复选）

给定一个不含重复数字的数组 nums ，返回其 所有可能的全排列 。你可以按任意顺序返回答案。

示例 1：

```go
输入：nums = [1,2,3]
输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
```

刚才讲的组合/子集问题使用 `start` 变量保证元素 `nums[start]` 之后只会出现 `nums[start+1..]` 中的元素，通过固定元素的相对位置保证不出现重复的子集。

但排列问题本身就是让你穷举元素的位置，`nums[i]` 之后也可以出现 `nums[i]` 左边的元素，所以之前的那一套玩不转了，需要额外使用 `used` 数组来标记哪些元素还可以被选择。

标准全排列可以抽象成如下这棵多叉树：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202412241612892.png)

我们用 `used` 数组标记已经在路径上的元素避免重复选择，然后收集所有叶子节点上的值，就是所有全排列的结果：

```go
func permute(nums []int) [][]int {
    var res [][]int
    // 记录回溯算法的递归路径
    var track []int
    // track 中的元素会被标记为 true
    used := make([]bool, len(nums))

    // 回溯算法核心函数
    var backtrace func()
    backtrace = func() {
        // base case，到达叶子节点
        if len(track) == len(nums) {
            // 收集叶子节点上的值
            res = append(res, append([]int(nil), track...))
            return
        }
        // 回溯算法标准框架
        for i := 0; i < len(nums); i++ {
            if used[i] {
                continue
            }
            // 做选择
            used[i] = true
            track = append(track, nums[i])
            // 进入下一层回溯树
            backtrace()
            // 取消选择
            track = track[:len(track)-1]
            used[i] = false
        }
    }
    backtrace()
    return res
}
```

#### 90.子集 II（元素可重不可复选）

给你一个整数数组 nums ，其中可能包含重复元素，请你返回该数组所有可能的子集（幂集）。

解集不能包含重复的子集。返回的解集中，子集可以按任意顺序排列。

示例 1：

```go
输入：nums = [1,2,2]
输出：[[],[1],[1,2],[1,2,2],[2],[2,2]]
```

需要进行剪枝去除重复结果，如果一个节点有多条值相同的树枝相邻，则只遍历第一条，剩下的都剪掉，不要去遍历。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202412241630544.png)

先对元素进行排序，让相同的元素靠在一起，如果发现 nums[i] == nums[i-1]，则跳过：

```go
func subsetsWithDup(nums []int) [][]int {
	var res [][]int
    // 记录回溯算法的递归路径
	var track []int
    // 先排序，让相同的元素靠在一起
	sort.Ints(nums)

	var backtrack func(int)
	backtrack = func(start int) {
        // 前序位置，每个节点的值都是一个子集
		res = append(res, append([]int(nil), track...))

		for i := start; i < len(nums); i++ {
            // 剪枝逻辑，值相同的相邻树枝，只遍历第一条
			if i > start && nums[i] == nums[i-1] {
				continue
			}
			track = append(track, nums[i])
			backtrack(i + 1)
			track = track[:len(track)-1]
		}
	}
	backtrack(0)
	return res
}
```

#### 40.组合总和 II（元素可重不可复选）

给定一个候选人编号的集合 candidates 和一个目标数 target，找出 candidates 中所有可以使数字和为 target 的组合。

candidates 中的每个数字在每个组合中只能使用一次 。

注意：解集不能包含重复的组合。 

示例 1:

```go
输入: candidates = [10,1,2,7,6,1,5], target = 8,
输出:
[
[1,1,6],
[1,2,5],
[1,7],
[2,6]
]
```

说这是一个组合问题，其实换个问法就变成子集问题了：请你计算 candidates 中所有和为 target 的子集。

对比子集问题的解法，只要额外用一个 trackSum 变量记录回溯路径上的元素和，然后将 base case 改一改即可解决这道题：

```go
func combinationSum2(nums []int, target int) [][]int {
	var res [][]int
	var track []int
    // 记录 track 中的元素之和
	var trackSum int
    // 先排序，让相同的元素靠在一起
	sort.Ints(nums)

    // 回溯算法主函数
	var backtrack func(int)
	backtrack = func(start int) {
        // base case，达到目标和，找到符合条件的组合
		if trackSum == target {
			res = append(res, append([]int(nil), track...))
            return
		}
        // base case，超过目标和，直接结束
		if trackSum > target {
			return
		}
        // 回溯算法标准框架
		for i := start; i < len(nums); i++ {
            // 剪枝逻辑，值相同的树枝，只遍历第一条
			if i > start && nums[i] == nums[i-1] {
				continue
			}
            // 做选择
			track = append(track, nums[i])
			trackSum += nums[i]
            // 递归遍历下一层回溯树
			backtrack(i + 1)
            // 撤销选择
			track = track[:len(track)-1]
			trackSum -= nums[i]
		}
	}
	backtrack(0)
	return res
}
```

#### 47.全排列 II（元素可重不可复选）

给定一个可包含重复数字的序列 nums ，按任意顺序 返回所有不重复的全排列。

示例 1：

```go
输入：nums = [1,1,2]
输出：
[[1,1,2],
 [1,2,1],
 [2,1,1]]
``` 

对比之前的[标准全排列解法代码](#_46-全排列-元素无重不可复选)，这段解法代码只有两处不同：

- 1.对 nums 进行了排序。
- 2.添加了一句额外的剪枝逻辑。

```go
func permuteUnique(nums []int) [][]int {
	var res [][]int
	var track []int
    // track 中的元素会被标记为 true
	used := make([]bool, len(nums))
    // 先排序，让相同的元素靠在一起
	sort.Ints(nums)

	var backtrack func()
	backtrack = func() {
		if len(track) == len(nums) {
			res = append(res, append([]int(nil), track...))
            return
		}
        // 注意起始是 0，没有 start
		for i := 0; i < len(nums); i++ {
			if used[i] {
				continue
			}
            // 新添加的剪枝逻辑，固定相同的元素在排列中的相对位置
            // 说明当前数字与前一个数字相同，并且前一个数字尚未被使用，此时跳过以避免重复排列
			if i > 0 && nums[i] == nums[i-1] && !used[i-1] {
				continue
			}

			used[i] = true
			track = append(track, nums[i])
			backtrack()
			track = track[:len(track)-1]
			used[i] = false
		}
	}
	backtrack()
	return res
}
```

#### 39.组合总和（元素无重可复选）

给你一个无重复元素的整数数组 candidates 和一个目标整数 target，找出 candidates 中可以使数字和为目标数 target 的所有不同组合，并以列表形式返回。你可以按任意顺序返回这些合。

candidates 中的同一个数字可以无限制重复被选取。如果至少一个数字的被选数量不同，则两种组合是不同的。 

对于给定的输入，保证和为 target 的不同组合数少于 150 个。

示例 1：

```go
输入：candidates = [2,3,6,7], target = 7
输出：[[2,2,3],[7]]
解释：
2 和 3 可以形成一组候选，2 + 2 + 3 = 7 。注意 2 可以使用多次。
7 也是一个候选， 7 = 7 。
仅有这两种组合。
```

在之前处理无重复元素的子集/组合问题时，我们在调用 backtrack 函数的时候传入 `i + 1`，这个 i 从 start 开始，那么下一层回溯树就是从 start + 1 开始，从而保证 nums[start] 这个元素不会被重复使用。

那么反过来，如果我想让每个元素被重复使用，我只要把 `i + 1` 改成 `i` 即可：

```go
func combinationSum(nums []int, target int) [][]int {
	var res [][]int
    // 记录回溯的路径
	var track []int
    // 记录 track 中的路径和
    var trackSum int

    var backtrack func(int)
    backtrack = func(start int) {
        // base case，找到目标和，记录结果
        if trackSum == target {
            res = append(res, append([]int(nil), track...))
            return
        }
        // base case，超过目标和，停止向下遍历
        if trackSum > target {
            return
        }

        // 回溯算法标准框架
        for i := start; i < len(nums); i++ {
            // 选择 nums[i]
            trackSum += nums[i]
            track = append(track, nums[i])
            // 递归遍历下一层回溯树
            // 同一元素可重复使用，注意参数
            backtrack(i)
            // 撤销选择 nums[i]
            track = track[:len(track)-1]
            trackSum -= nums[i]
        }
    }

    backtrack(0)
    return res

}
```

#### 括号生成

数字 n 代表生成括号的对数，请你设计一个函数，用于能够生成所有可能的并且有效的括号组合。

示例 1：

```go
输入：n = 3
输出：["((()))","(()())","(())()","()(())","()()()"]
```

这道题的核心思路是通过递归回溯生成所有可能的括号组合，并用剪枝条件确保只生成合法的组合：

- 1. 用 `left` 和 `right` 分别表示剩余的左括号和右括号数量。
- 2. 剪枝条件：右括号数量不能少于左括号（`right < left`）且括号数量不能小于 0。
- 3. 每次递归选择添加左括号或右括号，并在左右括号都用完时记录结果。

```go
func generateParenthesis(n int) []string {
    var track string
    var res []string

    var backtrack func(left, right int)
    backtrack = func(left, right int) {
        // 若左括号剩下的多，说明不合法
        // 可以排除掉类似 ))(( 这种无效的括号，因为 ))( 的时候 right < left，已经被排除了
        if right < left {
            return
        }
        // 数量小于 0 肯定是不合法的
        if left < 0 || right < 0 {
            return
        }
        // 当所有括号都恰好用完时，得到一个合法的括号组合
        if left == 0 && right == 0 {
            res = append(res, track)
            return
        }

        // 做选择，尝试放一个左括号
        track += "("
        backtrack(left-1, right)
        // 撤销选择
        track = track[:len(track)-1]

        // 做选择，尝试放一个右括号
        track += ")"
        backtrack(left, right-1)
        // 撤销选择
        track = track[:len(track)-1]
    }

    backtrack(n, n)
    return res
}
```

#### 698. 划分为k个相等的子集

给定一个整数数组  nums 和一个正整数 k，找出是否有可能把这个数组分成 k 个非空子集，其总和都相等。

示例 1：

```go
输入： nums = [4, 3, 2, 3, 5, 2, 1], k = 4
输出： True
说明： 有可能将其分成 4 个子集（5），（1,4），（2,3），（2,3）等于总和。
```
