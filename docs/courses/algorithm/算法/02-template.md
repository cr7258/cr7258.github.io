---
title: 算法解题套路框架
author: Se7en
categories:
  - Algorithm
tags:
  - Algorithm
---

# 算法解题套路框架

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

| LeetCode                                                              | 难度 | 类型 |
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

- 只使用数字 1 到 9
- 每个数字最多使用一次 

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

给定一个不含重复数字的数组 nums ，返回其所有可能的全排列 。你可以按任意顺序返回答案。

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

#### 22.括号生成

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

## 数组

### 快慢指针

#### 原地修改

##### 26. 删除有序数组中的重复项

给你一个非严格递增排列的数组 nums，请你原地删除重复出现的元素，使每个元素只出现一次，返回删除后数组的新长度。元素的相对顺序应该保持一致。然后返回 nums 中唯一元素的个数。

考虑 nums 的唯一元素的数量为 k，你需要做以下事情确保你的题解可以被通过：

- 更改数组 nums，使 nums 的前 k 个元素包含唯一元素，并按照它们最初在 nums 中出现的顺序排列。nums 的其余元素与 nums 的大小不重要。
- 返回 k。

示例 1：

```go
输入：nums = [1,1,2]
输出：2, nums = [1,2,_]
解释：函数应该返回新的长度 2 ，并且原数组 nums 的前两个元素被修改为 1, 2 。不需要考虑数组中超出新长度后面的元素。
```

我们让慢指针 slow 走在后面，快指针 fast 走在前面探路，找到一个不重复的元素就赋值给 slow 并让 slow 前进一步。

这样，就保证了 nums[0..slow] 都是无重复的元素，当 fast 指针遍历完整个数组 nums 后，nums[0..slow] 就是整个数组去重之后的结果。

```go
func removeDuplicates(nums []int) int {
    if len(nums) == 0 {
        return 0
    }
    slow,fast :=0,0
    for fast<len(nums) {
        if nums[fast] != nums[slow] {
            slow++
            // 维护 nums[0..slow] 无重复
            nums[slow] = nums[fast]
        }
        fast++
    }
    // 数组长度为索引 + 1
    return slow + 1
}
```

##### 27. 移除元素

给你一个数组 nums 和一个值 val，你需要原地移除所有数值等于 val 的元素。元素的顺序可能发生改变。然后返回 nums 中与 val 不同的元素的数量。

假设 nums 中不等于 val 的元素数量为 k，要通过此题，您需要执行以下操作：

- 更改 nums 数组，使 nums 的前 k 个元素包含不等于 val 的元素。nums 的其余元素和 nums 的大小并不重要。
- 返回 k。

示例 1：

```go
输入：nums = [3,2,2,3], val = 3
输出：2, nums = [2,2,_,_]
解释：你的函数函数应该返回 k = 2, 并且 nums 中的前两个元素均为 2。
你在返回的 k 个元素之外留下了什么并不重要（因此它们并不计入评测）。
```

如果 fast 遇到值为 val 的元素，则直接跳过，否则就赋值给 slow 指针，并让 slow 前进一步。

这和前面说到的数组去重问题解法思路是完全一样的，直接看代码：

```go
func removeElement(nums []int, val int) int {
    fast, slow := 0, 0
    for fast < len(nums) {
        if nums[fast] != val {
            nums[slow] = nums[fast]
            slow++
        }
        fast++
    }
    return slow
}
```

注意这里和有序数组去重的解法有一个细节差异，我们这里是先给 nums[slow] 赋值然后再给 slow++，这样可以保证 nums[0..slow-1] 是不包含值为 val 的元素的，最后的结果数组长度就是 slow。


#### 滑动窗口

滑动窗口算法技巧主要用来解决子数组问题，比如让你寻找符合某个条件的最长/最短子数组。

##### 模板

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

##### 例题

| LeetCode | 难度 |
|------|------|
| [438.找到字符串中所有字母异位词](https://leetcode.cn/problems/find-all-anagrams-in-a-string/description/) | 🟡 |
| [567.字符串的排列](https://leetcode.cn/problems/permutation-in-string/description/) | 🟡 |
| [3.无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/description/) | 🟡 |
| [76.最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/description/) | 🔴 |

###### 76.最小覆盖子串

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

###### 567.字符串的排列

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

###### 438.找到字符串中所有字母异位词

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

###### 4.最长无重复子串

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

#### 左右指针

##### 二分查找

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

##### n 数之和

总结来说，这类 nSum 问题就是给你输入一个数组 nums 和一个目标和 target，让你从 nums 选择 n 个数，使得这些数字之和为 target。

| LeetCode  | 难度 |
|---------------------------------------------------|------|
|[1.两数之和](https://leetcode.cn/problems/two-sum)            | 🟢   |
|[15.三数之和](https://leetcode.cn/problems/3sum)               | 🟠   |
|[18.四数之和](https://leetcode.cn/problems/4sum)               | 🟠   |

###### 1.两数之和

假设输入一个数组 nums 和一个目标和 target，请你返回 nums 中所有能够凑出 target 的两个元素的值，其中不能出现重复，比如说输入为 nums = [1,3,1,2,2,3], target = 4，那么算法返回的结果就是：[[1,3],[2,2]]（注意，我要求返回元素，而不是索引）。比如 [1,3] 和 [3,1] 就算重复，只能算一次。

我们可以先对 nums 排序，然后利用左右双指针技巧，从两端相向而行。当给 res 加入一次结果后，lo 和 hi 不仅应该相向而行，而且应该跳过所有重复的元素。


![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202412251104761.png)

```go
func twoSum(nums []int, target int) [][]int {
    // nums 数组必须有序
    sort.Ints(nums)
    var lo, hi int = 0, len(nums) - 1
    var res [][]int
    for lo < hi {
        sum := nums[lo] + nums[hi]
        // 记录索引 lo 和 hi 最初对应的值
        left, right := nums[lo], nums[hi]
        if sum < target {
            lo++
        } else if sum > target {
            hi--
        } else {
            res = append(res, []int{left, right})
            
            // 跳过所有重复的元素
            for lo < hi && nums[lo] == left {
                lo++
            }
            for lo < hi && nums[hi] == right {
                hi--
            }
        }
    }
    return res
}
```

注意 LeetCode 的 [1.两数之和](https://leetcode.cn/problems/two-sum) 一题中，要求返回的是数组下标，因此不能对原数组进行排序，需要使用哈希表的做法，解法参考：[hot100#两数之和](01-hot100#两数之和)。

###### 15.三数之和

给你一个整数数组 nums，判断是否存在三元组 [nums[i], nums[j], nums[k]] 满足 i != j、i != k 且 j != k，同时还满足 nums[i] + nums[j] + nums[k] == 0。请你返回所有和为 0 且不重复的三元组。

注意：答案中不可以包含重复的三元组。

示例 1：

```go
输入：nums = [-1,0,1,2,-1,-4]
输出：[[-1,-1,2],[-1,0,1]]
解释：
nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0 。
nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0 。
nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0 。
不同的三元组是 [-1,0,1] 和 [-1,-1,2] 。
注意，输出的顺序和三元组的顺序并不重要。
```


穷举第一个数，并保证一个数不重复，然后复用 twoSum 函数会保证后面两个数不重复。将 twoSum 返回的结果加上第一个数放到结果列表中。 

```go
// 计算数组 nums 中所有和为 target 的三元组
func threeSum(nums []int) [][]int {
    // 数组得排个序 
	sort.Ints(nums)
	var res [][]int
	n := len(nums)
    // 穷举 threeSum 的第一个数
	for i := 0; i < n; i++ {
        // 跳过第一个数字重复的情况，否则会出现重复结果
        if i > 0 && nums[i] == nums[i-1] {
            continue
        }

        // 对 target - nums[i] 计算 twoSum
		tuples := twoSum(nums, i+1, 0-nums[i])
        // 如果存在满足条件的二元组，再加上 nums[i] 就是结果三元组
		for _, tuple := range tuples {
			tuple = append(tuple, nums[i])
			res = append(res, tuple)
		}
	}
	return res
}

// 从 nums[start] 开始，计算有序数组 nums 中所有和为 target 的二元组
func twoSum(nums []int, start int, target int) [][]int {
	var res [][]int
    // 左指针改为从 start 开始，其他不变
	lo, hi := start, len(nums)-1
	for lo < hi {
		sum := nums[lo] + nums[hi]
		left, right := nums[lo], nums[hi]
		if sum < target {
			lo++
		} else if sum > target {
			hi--
		} else {
			res = append(res, []int{nums[lo], nums[hi]})

			for lo < hi && nums[lo] == left {
				lo++
			}
			for lo < hi && nums[hi] == right {
				hi--
			}
		}
	}
	return res
}
```

###### 18.四数之和

给你一个由 n 个整数组成的数组 nums，和一个目标值 target。请你找出并返回满足下述全部条件且不重复的四元组 [nums[a], nums[b], nums[c], nums[d]]（若两个四元组元素一一对应，则认为两个四元组重复）：

- 0 <= a, b, c, d < n
- a、b、c 和 d 互不相同
- nums[a] + nums[b] + nums[c] + nums[d] == target

你可以按任意顺序返回答案。

示例 1：

```go
输入：nums = [1,0,-1,0,-2,2], target = 0
输出：[[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]
```

fourSum 完全就可以用相同的思路：穷举第一个数字，然后调用 threeSum 函数计算剩下三个数，最后组合出和为 target 的四元组。

我们可以使用一个统一的 nSum 递归函数来解决，这样如果有 100Sum 的问题也一样可以处理。

```go
func fourSum(nums []int, target int) [][]int {
    sort.Ints(nums)
    return nSum(nums, 4, 0, target)
}

// 注意：调用这个函数之前一定要先给 nums 排序
// n 填写想求的是几数之和，start 从哪个索引开始计算（一般填 0），target 填想凑出的目标和
func nSum(nums []int, n int, start int, target int) [][]int {
    sz := len(nums)
    res := [][]int{}
    // 至少是 2Sum，且数组大小不应该小于 n
    if n < 2 || sz < n {
        return res
    }
    // 2Sum 是 base case
    if n == 2 {
        lo, hi := start, sz-1
        for lo < hi {
            sum := nums[lo] + nums[hi]
            left, right := nums[lo], nums[hi]
            if sum < target {
                for lo < hi && nums[lo] == left {
                    lo++
                }
            } else if sum > target {
                for lo < hi && nums[hi] == right {
                    hi--
                }
            } else {
                res = append(res, []int{left, right})
                for lo < hi && nums[lo] == left {
                    lo++
                }
                for lo < hi && nums[hi] == right {
                    hi--
                }
            }
        }
    } else {
        // n > 2 时，递归计算 (n-1)Sum 的结果
        for i := start; i < sz; i++ {
            // 跳过重复值
            if i > start && nums[i] == nums[i-1] {
                continue
            }
            subs := nSum(nums, n-1, i+1, target-nums[i])
            for _, sub := range subs {
                // (n-1)Sum 加上 nums[i] 就是 nSum
                res = append(res, append(sub, nums[i]))
            }
        }
    }
    return res
}
```

##### 反转数组

###### 344.反转字符串

编写一个函数，其作用是将输入的字符串反转过来。输入字符串以字符数组 s 的形式给出。

不要给另外的数组分配额外的空间，你必须原地修改输入数组、使用 O(1) 的额外空间解决这一问题。

示例 1：

```go
输入：s = ["h","e","l","l","o"]
输出：["o","l","l","e","h"]
```

```go
func reverseString(s []byte)  {
    // 一左一右两个指针相向而行
    left, right := 0, len(s)-1
    for left < right {
        // 交换 s[left] 和 s[right]
        s[left], s[right] = s[right], s[left]
        left++
        right--
    }
}
```

##### 回文串判断

回文串就是正着读和反着读都一样的字符串。比如说字符串 aba 和 abba 都是回文串，因为它们对称，反过来还是和本身一样；反之，字符串 abac 就不是回文串。

现在你应该能感觉到回文串问题和左右指针肯定有密切的联系，比如让你判断一个字符串是不是回文串，你可以写出下面这段代码：

```go
func isPalindrome(s string) bool {
    // 一左一右两个指针相向而行
    left, right := 0, len(s) - 1
    for left < right {
        if s[left] != s[right] {
            return false
        }
        left++
        right--
    }
    return true
}
```

###### 5.最长回文子串

给你一个字符串 s，找到 s 中最长的回文子串。

示例 1：

```go
输入：s = "babad"
输出："bab"
解释："aba" 同样是符合题意的答案。
```

遍历 s，分别找到以 i 为中心的奇数和偶数的最长回文子串，最后返回最长的回文子串。

```go
func longestPalindrome(s string) string {
    var res string
    for i := 0; i < len(s); i++ {
        // 以 s[i] 为中心的最长回文子串
        s1 := palindrome(s, i, i)
        // 以 s[i] 和 s[i+1] 为中心的最长回文子串
        s2 := palindrome(s, i, i+1)
        // res = longest(res, s1, s2)
        if len(res) < len(s1) {
            res = s1
        }
        if len(res) < len(s2) {
            res = s2
        }
    }
    return res
}
// 在 s 中寻找以 s[l] 和 s[r] 为中心的最长回文串
func palindrome(s string, l int, r int) string {
    // 防止索引越界
    for l >= 0 && r < len(s) && s[l] == s[r] {
        // 双指针，向两边展开
        l--
        r++
    }
    // 返回以 s[l] 和 s[r] 为中心的最长回文串
    return s[l+1 : r]
}
```

### 二维数组遍历

#### 顺/逆时针旋转矩阵

我们可以先将 n x n 矩阵 matrix 按照左上到右下的对角线进行镜像对称：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202412251533896.png)

然后再对矩阵的每一行进行反转：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202412251533432.png)

发现结果就是 matrix 顺时针旋转 90 度的结果：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202412251533794.png)

```go
var rotate = func(matrix [][]int) {
    // 将二维矩阵原地顺时针旋转 90 度
    n := len(matrix)
    // 先沿对角线镜像对称二维矩阵
    for i := 0; i < n; i++ {
        for j := i; j < n; j++ {
            // swap(matrix[i][j], matrix[j][i]);
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
        }
    }
    // 然后反转二维矩阵的每一行
    for _, row := range matrix {
        reverse(row)
    }
}

// 翻转一维数组
func reverse(arr []int) {
    i, j := 0, len(arr) - 1
    for j > i {
        // swap(arr[i], arr[j]);
        arr[i], arr[j] = arr[j], arr[i]
        i++
        j--
    }
}
```

如何将矩阵逆时针旋转 90 度呢？思路是类似的，只要通过另一条对角线镜像对称矩阵，然后再反转每一行，就得到了逆时针旋转矩阵的结果：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202412251537245.png)

```go
// 将二维矩阵原地逆时针旋转 90 度
func rotate2(matrix [][]int) {
    n := len(matrix)
    // 沿左下到右上的对角线镜像对称二维矩阵
    for i := 0; i < n; i++ {
        for j := 0; j < n - i; j++ {
            // swap(matrix[i][j], matrix[n-j-1][n-i-1])
            temp := matrix[i][j]
            matrix[i][j] = matrix[n - j - 1][n - i - 1]
            matrix[n - j - 1][n - i - 1] = temp
        }
    }

    // 然后反转二维矩阵的每一行
    for _, row := range matrix {
        reverse(row)
    }
}

func reverse(arr []int) {
    // 见上文
}
```

#### 矩阵的螺旋遍历

##### 54.螺旋矩阵

解题的核心思路是按照右、下、左、上的顺序遍历数组，并使用四个变量圈定未遍历元素的边界：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202412251540244.png)

```go
func spiralOrder(matrix [][]int) []int {
    var res []int
    m := len(matrix)
    n := len(matrix[0])
    upper_bound := 0
    lower_bound := m - 1
    left_bound := 0
    right_bound := n - 1
    // res.size() == m * n 则遍历完整个数组
    for len(res) < m*n {
        if upper_bound <= lower_bound {
            // 在顶部从左向右遍历
            for j := left_bound; j <= right_bound; j++ {
                res = append(res, matrix[upper_bound][j])
            }
            // 上边界下移
            upper_bound++
        }
        
        if left_bound <= right_bound {
            // 在右侧从上向下遍历
            for i := upper_bound; i <= lower_bound; i++ {
                res = append(res, matrix[i][right_bound])
            }
            // 右边界左移
            right_bound--
        }
        
        if upper_bound <= lower_bound {
            // 在底部从右向左遍历
            for j := right_bound; j >= left_bound; j-- {
                res = append(res, matrix[lower_bound][j])
            }
            // 下边界上移
            lower_bound--
        }
        
        if left_bound <= right_bound {
            // 在左侧从下向上遍历
            for i := lower_bound; i >= upper_bound; i-- {
                res = append(res, matrix[i][left_bound])
            }
            // 左边界右移
            left_bound++
        }
    }
    return res
}
```

##### 59.螺旋矩阵 II

与 [54.螺旋矩阵](https://leetcode.cn/problems/spiral-matrix-ii/description/) 一题类似，只不过是反过来，让你按照螺旋的顺序生成矩阵：

```go
func generateMatrix(n int) [][]int {
    matrix := make([][]int, n)
    for i := range matrix {
        matrix[i] = make([]int, n)
    }
    upper_bound, lower_bound := 0, n - 1
    left_bound, right_bound := 0, n - 1
    // 需要填入矩阵的数字
    num := 1

    for num <= n * n {
        if upper_bound <= lower_bound {
            // 在顶部从左向右遍历
            for j := left_bound; j <= right_bound; j++ {
                matrix[upper_bound][j] = num
                num++
            }
            // 上边界下移
            upper_bound++
        }

        if left_bound <= right_bound {
            // 在右侧从上向下遍历
            for i := upper_bound; i <= lower_bound; i++ {
                matrix[i][right_bound] = num
                num++
            }
            // 右边界左移
            right_bound--
        }

        if upper_bound <= lower_bound {
            // 在底部从右向左遍历
            for j := right_bound; j >= left_bound; j-- {
                matrix[lower_bound][j] = num
                num++
            }
            // 下边界上移
            lower_bound--
        }

        if left_bound <= right_bound {
            // 在左侧从下向上遍历
            for i := lower_bound; i >= upper_bound; i-- {
                matrix[i][left_bound] = num
                num++
            }
            // 左边界右移
            left_bound++
        }
    }
    return matrix
}
```

### 前缀和

#### [区域和检索 - 数组不可变](https://leetcode.cn/problems/range-sum-query-immutable/description/)

给定一个整数数组 nums，处理以下类型的多个查询：

计算索引 left 和 right （包含 left 和 right）之间的 nums 元素的和 ，其中 left <= right，实现 NumArray 类：

- `NumArray(int[] nums)` 使用数组 nums 初始化对象
- `int sumRange(int i, int j)` 返回数组 nums 中索引 left 和 right 之间的元素的 总和 ，包含 left 和 right 两点（也就是 `nums[left] + nums[left + 1] + ... + nums[right]`)
 
示例 1：

```go
输入：
["NumArray", "sumRange", "sumRange", "sumRange"]
[[[-2, 0, 3, -5, 2, -1]], [0, 2], [2, 5], [0, 5]]
输出：
[null, 1, -1, -3]

解释：
NumArray numArray = new NumArray([-2, 0, 3, -5, 2, -1]);
numArray.sumRange(0, 2); // return 1 ((-2) + 0 + 3)
numArray.sumRange(2, 5); // return -1 (3 + (-5) + 2 + (-1)) 
numArray.sumRange(0, 5); // return -3 ((-2) + 0 + 3 + (-5) + 2 + (-1))
```

`sumRange` 函数需要计算并返回一个索引区间之内的元素和，没学过前缀和的人可能写出如下代码：

```go
type NumArray struct {
    nums []int
}

func Constructor(nums []int) NumArray {
    return NumArray {
        nums: nums,
    }
}

func (this *NumArray) SumRange(left int, right int) int {
    sum := 0
    for i := left; i <= right; i++ {
        sum += this.nums[i]
    }
    return sum
}
```

这个解法每次调用 sumRange 函数时，都要进行一次 for 循环遍历，时间复杂度为 O(N)，而 sumRange 的调用频率可能非常高，所以这个算法的效率很低。

正确的解法是使用前缀和技巧进行优化，使得 sumRange 函数的时间复杂度为 O(1)：

```go
type NumArray struct {
    // 前缀和数组
    PreSum []int
}

// 输入一个数组，构造前缀和
func Constructor(nums []int) NumArray {
    // PreSum[0] = 0，便于计算累加和
    preSum := make([]int, len(nums)+1)
    // 计算 nums 的累加和
    for i := 1; i < len(preSum); i++ {
        preSum[i] = preSum[i-1] + nums[i-1]
    }
    return NumArray{PreSum: preSum}
}

// 查询闭区间 [left, right] 的累加和
func (this *NumArray) SumRange(left int, right int) int {   
    return this.PreSum[right+1] - this.PreSum[left]
}
```

看这个 preSum 数组，如果我想求索引区间 [0, 2] 内的所有元素之和，就可以通过 preSum[3] - preSum[0] 得出（结果是 1）。如果想求 [2, 5] 内的元素和，则用 preSum[6] - preSum[2] 得出（结果是 3）。因为为了便于计算累加和，将 preSum[0] 设置为 0，所以在计算累加和时 preSum 的下标要加 1。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502081139215.png)

#### [304. 二维区域和检索 - 矩阵不可变](https://leetcode.cn/problems/range-sum-query-2d-immutable/description/)

给定一个二维矩阵 matrix，以下类型的多个请求：

- 计算其子矩形范围内元素的总和，该子矩阵的左上角为 (row1, col1)，右下角 为 (row2, col2)。

实现 NumMatrix 类：

- `NumMatrix(int[][] matrix)` 给定整数矩阵 matrix 进行初始化
- `int sumRegion(int row1, int col1, int row2, int col2)` 返回左上角 (row1, col1)、右下角 (row2, col2) 所描述的子矩阵的元素总和。

示例 1：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502081153958.png)

```go
输入: 
["NumMatrix","sumRegion","sumRegion","sumRegion"]
[[[[3,0,1,4,2],[5,6,3,2,1],[1,2,0,1,5],[4,1,0,1,7],[1,0,3,0,5]]],[2,1,4,3],[1,1,2,2],[1,2,2,4]]
输出: 
[null, 8, 11, 12]

解释:
NumMatrix numMatrix = new NumMatrix([[3,0,1,4,2],[5,6,3,2,1],[1,2,0,1,5],[4,1,0,1,7],[1,0,3,0,5]]);
numMatrix.sumRegion(2, 1, 4, 3); // return 8 (红色矩形框的元素总和)
numMatrix.sumRegion(1, 1, 2, 2); // return 11 (绿色矩形框的元素总和)
numMatrix.sumRegion(1, 2, 2, 4); // return 12 (蓝色矩形框的元素总和)
```

任意子矩阵的元素和可以转化成它周边几个大矩阵的元素和的运算：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502081154238.png)

而这四个大矩阵有一个共同的特点，就是左上角都是 (0, 0) 原点。

那么做这道题更好的思路和一维数组中的前缀和是非常类似的，我们可以维护一个二维 preSum 数组，专门记录以原点为顶点的矩阵的元素之和，就可以用几次加减运算算出任何一个子矩阵的元素和：

```go
type NumMatrix struct {
    // preSum[i][j] 记录矩阵 [0, 0, i-1, j-1] 的元素和
    preSum [][]int
}

func Constructor(matrix [][]int) NumMatrix {
    // 初始化二维数组
    preSum := make([][]int, len(matrix) + 1)
    for i := 0; i < len(preSum); i++ {
        preSum[i] = make([]int, len(matrix[0]) + 1)
    }

    // 构建前缀和数组
    // preSum[i][j] 记录矩阵 [0, 0, i-1, j-1] 的元素和
    for i := 1; i < len(preSum); i ++ {
        for j := 1; j < len(preSum[0]); j++ {
            preSum[i][j] = preSum[i-1][j] + preSum[i][j-1] + matrix[i-1][j-1] - preSum[i-1][j-1];
        }
    }
    return NumMatrix{preSum}
}

func (this *NumMatrix) SumRegion(row1 int, col1 int, row2 int, col2 int) int {
    return this.preSum[row2+1][col2+1] - this.preSum[row1][col2+1] - this.preSum[row2+1][col1] + this.preSum[row1][col1] 
}
```

#### [和为 K 的子数组](https://leetcode.cn/problems/subarray-sum-equals-k/description/)

给你一个整数数组 nums 和一个整数 k，请你统计并返回该数组中和为 k 的子数组的个数。

子数组是数组中元素的连续非空序列。

示例 1：

```go
输入：nums = [1,1,1], k = 2
输出：2
```

示例 2：

```go
输入：nums = [1,2,3], k = 3
输出：2
```

- 用 prefixSum 表示当前的前缀和。
- 维护一个哈希表 countMap，其中键为前缀和，值为该前缀和出现的次数。
- 遍历数组时，通过 prefixSum - k 判断是否存在之前的前缀和满足条件。

```go
func subarraySum(nums []int, k int) int {
    countMap := make(map[int]int)
    countMap[0] = 1 // 初始前缀和为 0 的情况
    prefixSum := 0
    count := 0

    for _, num := range nums {
        prefixSum += num
        // 检查是否存在前缀和使得当前子数组和为 k
        if val, exists := countMap[prefixSum-k]; exists {
            count += val
        }
        // 更新当前前缀和的出现次数
        countMap[prefixSum]++
    }

    return count
}
```

核心思想：对于当前的前缀和 prefixSum，如果存在之前的某个前缀和为 prefixSum - k，那么从该位置到当前位置的子数组和即为 k。该前缀和出现的次数决定了能组成多少个满足条件的子数组。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502081311832.png)

### 差分数组

差分数组的主要适用场景是频繁对原始数组的某个区间的元素进行增减。

比如说，我给你输入一个数组 nums，然后又要求给区间 nums[2..6] 全部加 1，再给 nums[3..9] 全部减 3，再给 nums[0..4] 全部加 2...

#### [370.区间加法](https://leetcode.cn/problems/range-addition/description/)

假设你有一个长度为 n 的数组，初始情况下所有的数字均为 0，你将会被给出 k​​​​​​​ 个更新的操作。

其中，每个操作会被表示为一个三元组：[startIndex, endIndex, inc]，你需要将子数组 A[startIndex ... endIndex]（包括 startIndex 和 endIndex）增加 inc。

请你返回 k 次操作后的数组。

示例：

```go
输入: length = 5, updates = [[1,3,2],[2,4,3],[0,2,-2]]
输出: [-2,0,3,5,3]

解释:
初始状态:
[0,0,0,0,0]

进行了操作 [1,3,2] 后的状态:
[0,2,2,2,0]

进行了操作 [2,4,3] 后的状态:
[0,2,5,5,3]

进行了操作 [0,2,-2] 后的状态:
[-2,0,3,5,3]
```

解法如下：

```go
func getModifiedArray(length int, updates [][]int) []int {
    // nums 初始化为全 0
    nums := make([]int, length)
    // 构造差分解法
    df := NewDifference(nums)
    for _, update := range updates {
        i, j, val := update[0], update[1], update[2]
        df.Increment(i, j, val)
    }
    return df.Result()
}

// 差分数组
type Difference struct {
    diff []int
}

func NewDifference(nums []int) *Difference {
    assert(len(nums) > 0)
    diff := make([]int, len(nums))
    // 构造差分数组
    diff[0] = nums[0]
    for i := 1; i < len(nums); i++ {
        diff[i] = nums[i] - nums[i-1]
    }
    return &Difference{diff: diff}
}

// 给闭区间 [i, j] 增加 val（可以是负数）
func (d *Difference) Increment(i, j, val int) {
    d.diff[i] += val
    if j+1 < len(d.diff) {
        d.diff[j+1] -= val
    }
}

// 根据差分数组构造结果数组
func (d *Difference) Result() []int {
    res := make([]int, len(d.diff))
    // 根据差分数组构造结果数组
    res[0] = d.diff[0]
    for i := 1; i < len(d.diff); i++ {
        res[i] = res[i-1] + d.diff[i]
    }
    return res
}

func assert(condition bool) {
    if !condition {
        panic("condition failed")
    }
}
```

## 栈

### [71.简化路径](https://leetcode.cn/problems/simplify-path/description/)

给你一个字符串 path，表示指向某一文件或目录的 Unix 风格绝对路径 （以 '/' 开头），请你将其转化为更加简洁的规范路径。

在 Unix 风格的文件系统中规则如下：

- 一个点 '.' 表示当前目录本身。
- 此外，两个点 '..' 表示将目录切换到上一级（指向父目录）。
- 任意多个连续的斜杠（即，'//' 或 '///'）都被视为单个斜杠 '/'。
- 任何其他格式的点（例如，'...' 或 '....'）均被视为有效的文件/目录名称。

返回的 简化路径 必须遵循下述格式：

- 始终以斜杠 '/' 开头。
- 两个目录名之间必须只有一个斜杠 '/'。
- 最后一个目录名（如果存在）不能 以 '/' 结尾。
- 此外，路径仅包含从根目录到目标文件或目录的路径上的目录（即，不含 '.' 或 '..'）。

返回简化后得到的规范路径。

示例 1：

```go
输入：path = "/home/"
输出："/home"
解释：
应删除尾随斜杠。
```

示例 2：

```go
输入：path = "/home//foo/"
输出："/home/foo"
解释：
多个连续的斜杠被单个斜杠替换。
```

示例 3：

```go
输入：path = "/home/user/Documents/../Pictures"
输出："/home/user/Pictures"
解释：
两个点 ".." 表示上一级目录（父目录）。
```

这题比较简单，利用栈先进后出的特性处理上级目录 `..`，最后组装化简后的路径即可。

```go
func simplifyPath(path string) string {
    parts := strings.Split(path, "/")
    stk := []string{}
    // 借助栈计算最终的文件夹路径
    for _, part := range parts {
        if part == "" || part == "." {
            continue
        }
        if part == ".." {
            if len(stk) > 0 {
                stk = stk[:len(stk)-1]
            }
            continue
        }
        stk = append(stk, part)
    }
    // 栈中存储的文件夹组成路径
    res := ""
    for _, dir := range stk {
        res += "/" + dir
    }
    if res == "" {
        return "/"
    }
    return res
}
```