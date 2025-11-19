---
title: Shell 命令
author: Se7en
categories:
  - Algorithm
  - Shell
tags:
  - Algorithm
  - Shell
---

# Shell 命令

## Awk 命令

awk 命令是一种功能强大的文本处理工具和编程语言，主要用于在 Linux 和 Unix 系统中对文本文件或数据流进行分析、处理和格式化输出。它以行为单位逐行读取输入数据（可以是文件、标准输入或其他命令的输出），并根据用户定义的模式（pattern）匹配和动作（action）执行相应的操作。

### [Awk #1](https://www.hackerrank.com/challenges/awk-1/problem?isFullScreen=true)（判断字段数量）

**题目描述**：

找出每行中缺少任意一个成绩（English、Math、Science）的学生，打印提示信息。

* 每行包含学生标识符和三个成绩，字段之间以空格分隔。
* 如果某一行字段数量少于 4，说明有成绩缺失。
* 输出格式为：`Not all scores are available for [Identifier]`。

**示例：**

输入：

```text
A 25 27 50
B 35 75
C 75 78
D 99 88 76
```

输出：

```text
Not all scores are available for B
Not all scores are available for C
```

**答案：**

```bash
awk 'NF < 4 { print "Not all scores are available for " $1 }'
```

**解释：**

* `NF`：表示当前行的字段数量。
* `NF < 4`：判断该行是否缺少字段。
* `$1`：表示该行的第一个字段，即学生标识符。

### [Awk #2](https://www.hackerrank.com/challenges/awk-2/problem?isFullScreen=true)（判断字段数值）

**题目描述**：

给定学生成绩的表格数据，每行包括一个标识符和三门课程的成绩（英语、数学、科学）。判断每位学生是否全部及格。

* 成绩大于等于 50 视为及格。
* 三门都及格，输出 `Pass`；否则输出 `Fail`。

**示例：**

输入：

```text
A 25 27 50
B 35 37 75
C 75 78 80
```

输出：

```text
A : Fail
B : Fail
C : Pass
```

**答案：**

```bash
awk '{
  if ($2 >= 50 && $3 >= 50 && $4 >= 50)
    printf "%s : Pass\n", $1
  else
    printf "%s : Fail\n", $1
}'
```

**解释：**

* `$1`：学生标识符。
* `$2 $3 $4`：对应三门成绩。
* `if` 判断三门是否都 ≥ 50。
* `printf` 控制输出格式为 `[标识符] : [Pass/Fail]`。

### [Awk #3](https://www.hackerrank.com/challenges/awk-3/problem?isFullScreen=true)（多个条件判断）

**题目描述**：

对每位学生的三门课成绩（英语、数学、科学）求平均分，根据平均分给出对应等级。

* 平均分 ≥ 80：`A`
* 平均分 ≥ 60 且 < 80：`B`
* 平均分 ≥ 50 且 < 60：`C`
* 平均分 < 50：`FAIL`

**示例：**

输入：

```text
A 25 27 50
B 35 37 75
C 75 78 80
D 99 88 76
```

输出：

```text
A 25 27 50 : FAIL
B 35 37 75 : FAIL
C 75 78 80 : B
D 99 88 76 : A
```

**答案：**

```bash
awk '{
  avg = ($2 + $3 + $4) / 3
  grade = "FAIL"
  if (avg >= 80)
    grade = "A"
  else if (avg >= 60)
    grade = "B"
  else if (avg >= 50)
    grade = "C"
  printf "%s : %s\n", $0, grade
}'
```

**解释：**

* `$2 $3 $4`：分别为英语、数学、科学成绩。
* `avg`：三门课平均分。
* `grade`：根据 `avg` 判断等级。
* `$0`：原始的整行输入数据。

### [Awk #4](https://www.hackerrank.com/challenges/awk-4/problem?isFullScreen=true)（处理多行）

**题目描述**：

每两行数据拼接成一行，中间用分号 `;` 分隔。

* 每行包含学生的标识符和三门课程的成绩。
* 将每两行合并为一行输出。
* 如果总行数为奇数，最后一行也要输出，以分号结尾。

**示例：**

输入：

```text
A 25 27 50
B 35 37 75
C 75 78 80
D 99 88 76
```

输出：

```text
A 25 27 50;B 35 37 75
C 75 78 80;D 99 88 76
```

**答案：**

```bash
awk '
  NR % 2 == 1 { line = $0; next }
  NR % 2 == 0 { print line ";" $0 }
  END { if (NR % 2 == 1) print line ";" }
'
```

**解释：**

* `NR`：当前记录号（行号）。
* `NR % 2 == 1`：奇数行保存到变量 `line`。`next` 跳过当前行，开始处理下一行。
* `NR % 2 == 0`：偶数行时输出 `line;当前行`。
* `END { ... }`：如果总行数是奇数，打印最后一行（末尾加分号）。

## Cut 命令

cut 命令是 Linux 和 Unix 系统中用于从文件或输入的每一行中“剪切”出指定部分内容的工具，常用于文本处理和结构化数据提取。它可以按字节（-b）、字符（-c）或字段（-f）来截取数据，并将结果输出到标准输出。cut 命令的常用参数如下：

| 参数         | 说明                            |
| ---------- | ----------------------------- |
| `-b`  | 按字节位置提取内容                  |
| `-c`  | 按字符位置提取内容                  |
| `-f`  | 按字段提取内容                 |
| `-d` | 指定字段分隔符（默认为制表符）      |

### [Cut #1](https://www.hackerrank.com/challenges/text-processing-cut-1/problem?isFullScreen=true)（获取指定位置的字符）

**题目描述**：

给定 `N` 行输入，从每一行中提取第 **3 个字符**，输出共 `N` 行。

**示例：**

输入：

```text
Hello
World
how are you
```

输出：

```text
l
r
w
```

**答案：**

```bash
cut -c3
```

**解释：**

* `-c3`：提取每一行的第 3 个字符。

### [Cut #2](https://www.hackerrank.com/challenges/text-processing-cut-2/problem?isFullScreen=true)（获取 2 个指定位置的字符）

**题目描述**：

给定 `N` 行输入，从每一行中提取第 **2 个字符** 和第 **7 个字符**，输出共 `N` 行。

**示例：**

输入：

```text
Hello
World
how are you
```

输出：

```text
e
o
oe
```

**答案：**

```bash
cut -c2,7
```

**解释：**

* `-c2,7`：提取每一行的第 2 个和第 7 个字符。

### [Cut #3](https://www.hackerrank.com/challenges/text-processing-cut-3/problem?isFullScreen=true)（获取指定范围的字符）

**题目描述**：

将每一行中从第 **2 个字符开始** 到第 **7 个字符结束** 的字符范围提取出来，两个位置都包含。

* 每行都输出第 2 到第 7 个字符。
* 不足 7 个字符时只提取可用范围。

**示例：**

输入：

```text
Hello
World
how are you
```

输出：

```text
ello
orld
ow are
```

**答案：**

```bash
cut -c2-7
```

**解释：**

* `-c2-7`：表示提取每一行第 2 到第 7 个字符。

### [Cut #4](https://www.hackerrank.com/challenges/text-processing-cut-5/problem?isFullScreen=true)（获取默认 tab 分隔的字段）

**题目描述**：

给定一个以制表符（tab）分隔的文件，输出每行的前 **3 个字段**。

* 输入为 TSV 格式，每行有多个字段。
* 输出中每行仅保留前 3 个字段。

**示例：**

输入：

```text
1	New York, New York[10]	8,244,910	1	New York-Northern New Jersey-Long Island, NY-NJ-PA MSA	19,015,900	1	New York-Newark-Bridgeport, NY-NJ-CT-PA CSA	22,214,083
2	Los Angeles, California	3,819,702	2	Los Angeles-Long Beach-Santa Ana, CA MSA	12,944,801	2	Los Angeles-Long Beach-Riverside, CA CSA	18,081,569
```

输出：

```text
1	New York, New York[10]	8,244,910
2	Los Angeles, California	3,819,702
```

**答案：**

```bash
cut -f1-3
```

**解释：**

* `-f1-3`：提取第 1 到第 3 个字段。
* 默认使用制表符（tab）作为分隔符，适用于 TSV 格式文件。

### [Cut #5](https://www.hackerrank.com/challenges/text-processing-cut-7/problem?isFullScreen=true)（指定分隔符）

**题目描述**：

给定一句英文句子，提取每行中的第 **4 个单词**。假设单词之间仅由空格 `' '` 分隔。

**示例：**

输入：

```text
Hello World how are you
```

输出：

```text
are
```

**答案：**

```bash
cut -d ' ' -f4
```

**解释：**

* `-d ' '`：以空格作为字段分隔符。
* `-f4`：提取第 4 个字段（即第 4 个单词）。

## Sed 命令

sed 命令是 Linux/Unix 系统中的一种流编辑器（stream editor），用于对文本文件或输入的数据流进行逐行处理和编辑。它可以根据用户提供的脚本或命令，实现对文本的自动修改、替换、删除、插入等操作，而无需手动打开文件编辑。

参考资料：

- [Sed 备忘清单](https://quickref.me/zh-CN/docs/sed.html)
- [Sed - An Introduction and Tutorial by Bruce Barnett](https://www.grymoire.com/Unix/Sed.html#uh-40)

### [Sed #1](https://www.hackerrank.com/challenges/text-processing-in-linux-the-sed-command-1/problem?isFullScreen=true)（匹配完整单词）

**题目描述**：

将每一行中**第一个完整**单词 `the` 替换为 `this`。要求：

* 匹配完整单词（不能替换比如 `"thereby"`、`"theme"` 这样的子串）。
* 只替换每行中第一个匹配。

**示例：**

输入：

```text
the quick brown fox jumps over the lazy dog.
thereby lies the problem.
the theater is not the same as the theme park.
```

输出：

```text
this quick brown fox jumps over the lazy dog.
thereby lies this problem.
this theater is not the same as the theme park.
```

**答案：**

```bash
sed 's/\<the\>/this/'
```

**解释：**

* `\<the\>`：表示匹配**整个单词 `the`**（GNU sed 特有语法）。
* 使用单引号 `''` 防止 `\` 被 shell 提前解释。

### [Sed #2](https://www.hackerrank.com/challenges/text-processing-in-linux-the-sed-command-2/problem?isFullScreen=true)（全局替换、忽略大小写）

**题目描述**：

将每一行中**所有**完整单词 `thy` 替换为 `your`。要求：

* 匹配时不区分大小写（如 `thy`、`Thy`、`tHY` 等都应被替换）。
* 每行中出现多个时要全部替换。

**示例：**

输入：

```text
thy love is eternal. Thy soul is kind. worthy shall not change.
```

输出：

```text
your love is eternal. your soul is kind. worthy shall not change.
```

**答案：**

```bash
sed 's/thy/your/gI'
```

**解释：**

* `I`：忽略大小写，匹配 `Thy`、`THY` 等形式。
* `g`：全局替换，确保每行中所有匹配都被替换。
* 使用单引号 `''` 防止 `\` 被 shell 提前解释。

### [Sed #3](https://www.hackerrank.com/challenges/text-processing-in-linux-the-sed-command-3/problem?isFullScreen=true)（获取原始匹配内容）

**题目描述**：

将每一行中**所有出现的 `thy`**（不区分大小写）用花括号 `{}` 包裹起来。

* 匹配不要求是完整单词
* 大小写不敏感（如 `thy`、`Thy`、`THY` 等都应被替换）
* 每行中出现多个时全部替换

**示例：**

输入：

```text
Thy light guides thy path. worthy not matched.
```

输出：

```text
{Thy} light guides {thy} path. wor{thy} not matched.
```

**答案：**

```bash
sed -e 's/thy/{&}/gI'
```

**解释：**

* `thy`：匹配目标字符串
* `{&}`：`&` 表示**原始匹配内容**，如 `Thy` → `{Thy}`
* `g`：全局替换，替换每行所有匹配项
* `I`：忽略大小写，匹配 `Thy`、`tHy`、`THY` 等
* 使用单引号 `''` 防止 `\` 被 shell 提前解释。

### [Sed #4](https://www.hackerrank.com/challenges/sed-command-4/problem?isFullScreen=true)（正则表达式）

**题目描述**：

将每一行的信用卡号（格式为 `dddd dddd dddd dddd`）进行掩码处理，仅保留最后四位数字。

* 每行包含 16 位数字，分成 4 组，用空格分隔
* 仅保留最后一组数字，其余部分全部用 `****` 替代
* 格式仍保持为 `**** **** **** 1234`

**示例：**

输入：

```text
1234 5678 9101 1234
2999 5178 9101 2234
```

输出：

```text
**** **** **** 1234
**** **** **** 2234
```

**答案：**

```bash
sed 's/^[0-9]\{4\} [0-9]\{4\} [0-9]\{4\}/**** **** ****/'
```

**解释：**

* `^[0-9]\{4\}`：匹配 4 个一组的数字

### [Sed #5](https://www.hackerrank.com/challenges/sed-command-5/problem?isFullScreen=true)（扩展正则表达式）

**题目描述**：

将每一行中的信用卡号（格式为 `dddd dddd dddd dddd`）的**段顺序反转**。

* 每组由 4 位数字组成，共 4 组，空格分隔
* 输出格式仍保持为 4 组数字，每组 4 位

**示例：**

输入：

```text
1434 5678 9101 1234
2999 5178 9101 2234
```

输出：

```text
1234 9101 5678 1434
2234 9101 5178 2999
```

**答案：**

```bash
sed -E 's/([0-9]{4}) ([0-9]{4}) ([0-9]{4}) ([0-9]{4})/\4 \3 \2 \1/'
```

**解释：**

* `-E`（可选，或者 `-r`）：启用扩展正则（ERE），允许使用 `()` 和 `{}` 而无需转义。
* `([0-9]{4})`：匹配一组 4 位数字并捕获为一个分组（共捕获 4 个）。
* `\4 \3 \2 \1`：使用反向引用将捕获的四组倒序输出。

### Sed #6（匹配 IP 地址）

**题目描述**：

从给定的 IP 地址中提取 IP 地址。

**示例：**

输入：

```text
INFO 2024-06-18 12:00:00 client_ip=192.168.1.10 status=connected
```

输出：

```text
192.168.1.10
```

**答案：**

```bash
echo "INFO 2024-06-18 12:00:00 client_ip=192.168.1.10 status=connected" | sed -E 's/.*[^0-9]([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)[^0-9].*/\1/'
```

**解释：**

* `-E`：启用扩展正则（ERE）。
* `.*[^0-9]`：匹配任意字符（除数字外）。
* `([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)`：匹配 IP 地址并捕获。
* `[^0-9].*`：匹配剩余字符（除数字外）。
* `\1`：使用反向引用输出捕获的 IP 地址。

## Sort 命令

sort 命令是 Linux/Unix 系统中用于对文本文件或标准输入的内容按行进行排序的工具。它将文件的每一行作为一个单位，按照用户指定的规则（默认是 ASCII 码顺序）进行排序，排序结果输出到标准输出或指定文件。sort 命令的常用参数如下：

| 参数         | 说明                            |
| ---------- | ----------------------------- |
| `-k <start>[,<end>` | 指定按第 `<start>` 列（到第 `<end>` 列）排序            |
| `-n`       | 按数值进行排序                       |
| `-r`       | 逆序排序（从大到小）                    |
| `-t <delimiter>`  | 指定分隔符（默认是空白符）                 |
| `-u`       | 去重（只保留唯一的行）                   |
| `-f`       | 忽略大小写进行排序                     |
| `-b`       | 忽略每行前导空格                      |
| `-M`       | 按月份名称排序（如 Jan, Feb, Mar）      |
| `-V`       | 按“版本号”顺序排序（例如 1.2.9 < 1.10.1） |


### [Sort #1](https://www.hackerrank.com/challenges/text-processing-sort-5/problem?isFullScreen=true)（指定分隔符，指定排序字段）

**题目描述**：

给定一个以 Tab 分隔的气温数据表，每行包含城市名称与每月平均温度。请根据 **1 月份的平均温度（第 2 列）** 对所有行按**降序**排序。

* 每列由 tab 分隔。
* 输出按第 2 列的数值从大到小排序。

**示例：**

输入（节选）：

```text
Austin, Texas	50.2	68.3	84.2	70.6	33.65	85	0.9	62 / 58
Baton Rouge, La.	50.1	66.6	81.7	68.1	63.08	110.0	0.2	52 / 46
Boston, Mass.	29.3	48.3	73.9	54.1	42.53	127	42.8	52 / 66
```

输出（节选）：

```text
Austin, Texas	50.2	68.3	84.2	70.6	33.65	85	0.9	62 / 58
Baton Rouge, La.	50.1	66.6	81.7	68.1	63.08	110.0	0.2	52 / 46
Boston, Mass.	29.3	48.3	73.9	54.1	42.53	127	42.8	52 / 66
```

**答案：**

```bash
sort -t $'\t' -k2nr
```

**解释：**

* `-t $'\t'`：指定 tab 为字段分隔符。
* `-k2`：基于第 2 列排序。`-k<start>[,<end>]`：指定排序的起始和结束字段。
* `n`：按数值排序。
* `r`：降序排列。

## Tr 命令

tr 命令是 Linux/Unix 系统中的字符转换工具，主要用于对标准输入的字符进行替换、删除和压缩操作，然后将结果输出到标准输出。它可以将一组字符转换成另一组字符，常用于文本处理和格式化。tr 命令的常用参数如下：

| 参数         | 说明                            |
| ---------- | ----------------------------- |
| `-c`       | 取反，使用字符集的补集                  |
| `-d`       | 删除指定字符集中的字符                  |
| `-s`       | 压缩重复的字符为单个字符                 |
| `[:alnum:]`| 所有字母和数字                       |
| `[:alpha:]`| 所有字母                          |
| `[:digit:]`| 所有数字                          |
| `[:lower:]`| 所有小写字母                        |
| `[:upper:]`| 所有大写字母                        |
| `[:space:]`| 所有空白字符（空格、制表符、换行符等）          |
| `[:punct:]`| 所有标点符号                        |

### [Tr #1](https://www.hackerrank.com/challenges/text-processing-tr-1/problem?isFullScreen=true)（替换字符）

**题目描述**：

将文本中的所有圆括号 `()` 替换为方括号 `[]`。

* 替换所有左括号 `(` 为 `[`。
* 替换所有右括号 `)` 为 `]`。

**示例：**

输入：

```text
int i=(int)5.8
(23 + 5)*2
```

输出：

```text
int i=[int]5.8
[23 + 5]*2
```

**答案：**

```bash
tr '()' '[]'
```

**解释：**

* `'()'`：匹配圆括号字符。
* `'[]'`：将其替换为对应的方括号。
* 一一对应地将 `(` 替换为 `[`，`)` 替换为 `]`。

### [Tr #2](https://www.hackerrank.com/challenges/text-processing-tr-2/problem?isFullScreen=true)（删除字符）

**题目描述**：

删除文本中所有的小写字母 `a-z`。

* 只保留大写字母、空格及其他字符。
* 所有小写字符将被移除。

**示例：**

输入：

```text
Hello
World
how are you
```

输出：

```text
H
W
```

**答案：**

```bash
tr -d 'a-z'
```

**解释：**

* `-d`：删除指定字符集。
* `'a-z'`：表示所有小写字母，从 `a` 到 `z`。

### [Tr #3](https://www.hackerrank.com/challenges/text-processing-tr-3/problem?isFullScreen=true)（压缩字符）

**题目描述**：

将文本中所有连续的多个空格合并为一个空格。

* 所有空格序列压缩为单个空格。
* 不影响其他字符。

**示例：**

输入：

```text
He  llo
Wor   ld
how    are   you
```

输出：

```text
He llo
Wor ld
how are you
```

**答案：**

```bash
tr -s ' '
```

**解释：**

* `-s`：squeeze（压缩）重复字符。
* `' '`：目标是空格，将多个空格压缩成一个空格。

## Uniq 命令

uniq 命令是 Linux/Unix 系统中用于检测和处理文本文件中相邻重复行的工具。它主要功能包括去除重复行、统计重复行出现次数、只显示重复行或唯一行等。uniq 通常与 sort 命令结合使用，因为 uniq 只能处理相邻的重复行，使用 sort 能先将相同的行排列在一起。uniq 命令的常用参数如下：

| 参数         | 说明                            |
| ---------- | ----------------------------- |
| `-c`       | 显示每行重复出现的次数                  |
| `-d`       | 只显示重复的行（显示一次）                  |
| `-D`       | 显示所有重复的行                 |
| `-f N`     | 忽略比较的前 N 个字段                 |
| `-i`       | 忽略大小写差异                     |
| `-s N`     | 忽略比较的前 N 个字符                 |
| `-u`       | 只显示唯一的行（没有重复的行）                   |
| `-w N`     | 仅比较前 N 个字符，忽略后面的所有内容                |

### [Uniq #1](https://www.hackerrank.com/challenges/text-processing-in-linux-the-uniq-command-1/problem?isFullScreen=true)（移除重复行）

**题目描述**：

删除文本中**连续重复**的行，文本中重复的行已经排在相邻位置了。

**示例：**

输入：

```text
00
00
01
01
00
00
02
02
```

输出：

```text
00
01
00
02
```

**答案：**

```bash
uniq
```

### [Uniq #2](https://www.hackerrank.com/challenges/text-processing-in-linux-the-uniq-command-2/problem?isFullScreen=true)（统计重复次数）

**题目描述**：

统计每一行**连续重复**出现的次数，并输出重复次数和对应的行。

* 只统计连续重复的行。
* 输出格式为：`次数 内容`，中间用空格分隔。
* 不应包含行首多余空格。

**示例：**

输入：

```text
00
00
01
01
00
00
02
02
03
aa
aa
```

输出：

```text
2 00
2 01
2 00
2 02
1 03
2 aa
```

**答案：**

```bash
uniq -c | sed 's/^ *//'
```

**解释：**

* `uniq -c`：统计连续重复行的数量，并在每行前添加计数。
* `sed 's/^ *//'`：去除每行行首多余空格，保证输出格式正确。

### [Uniq #3](https://www.hackerrank.com/challenges/text-processing-in-linux-the-uniq-command-3/problem?isFullScreen=true)（忽略大小写）

**题目描述**：

统计**连续重复（不区分大小写）**的行出现的次数，输出重复次数和对应行内容。

* 比较时忽略大小写，例如 `aa`、`AA`、`Aa` 视为相同。
* 输出格式为：`次数 内容`，中间用空格分隔。
* 不应包含行首多余空格。

**示例：**

输入：

```text
00
00
01
01
00
00
02
02
03
aa
AA
Aa
```

输出：

```text
2 00
2 01
2 00
2 02
1 03
3 aa
```

**答案：**

```bash
uniq -ci | sed 's/^ *//'
```

**解释：**

* `uniq -c`：统计连续重复行的数量。
* `-i`：忽略大小写比较。
* `sed 's/^ *//'`：去除每行行首多余空格，保证输出格式正确。

### [Uniq #4](https://www.hackerrank.com/challenges/text-processing-in-linux-the-uniq-command-4/problem?isFullScreen=true)（找出不重复的行）

**题目描述**：

只显示文本中**未被前后重复行包围的行**（即只出现一次的行，且必须是**连续唯一**）。

* 区分大小写。
* 只过滤掉**相邻重复行**，非连续重复不影响唯一性。

**示例：**

输入：

```text
A00
a00
01
01
00
00
02
02
A00
03
aa
aa
aa
```

输出：

```text
A00
a00
A00
03
```

**答案：**

```bash
uniq -u
```

**解释：**

* `uniq`：用于去除或处理重复行。
* `-u`：仅输出没有相邻重复的唯一行。
