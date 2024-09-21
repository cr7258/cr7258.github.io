---
title: Git 速查手册
author: Se7en
date: 2024/08/01 10:00
categories:
 - 个人速查手册
tags:
 - Git
---

# Git 速查手册

## Git 基本流程

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202409212200772.png)

Git管理的文件有 5 种状态：

- 未跟踪（untracked）：新添加的文件，或被移除跟踪的文件，未建立跟踪，通过 git add 添加暂存并建立跟踪。
- 未修改：从仓库签出的文件默认状态，修改后就是“已修改”状态了。
- 已修改（modified）：文件被修改后的状态。
- 已暂存（staged）：修改、新增的文件添加到暂存区后的状态。
- 已提交(committed)：从暂存区提交到版本库。

## 分支操作

### 创建并切换分支

```bash
git checkout -b <new-branch-name>
```

### 切换分支

```bash
git checkout <branch-name>
```

### 重命名分支

先切换到要重命名的分支，然后执行以下命令：

```bash
git checkout <old-branch-name>
git branch -m <new-branch-name>
```

或者不需要切换分支，直接使用以下命令：

```bash
git branch -m <old-branch-name> <new-branch-name>
```

## Git Rebase

git rebase 是 Git 中一个用于合并变更的命令，可以将一个分支的提交“重新应用”到另一个分支上，同时保持提交历史的清晰。通常在下面的场景中使用：
- 我们从 main 分支拉取了一条 feature 分支在本地进行功能开发。
- 远程的 main 分支在之后又合并了一些新的提交。
- 我们想在 feature 分支集成 main 的最新更改。（比如与 main 分支有冲突，需要在 feature 分支解决冲突）

### 基本操作

1. **切换到要 rebase 的分支**：
```bash
git checkout <branch>
```

2. **执行 rebase**：将 `feature-branch` 的提交应用到 `main` 分支上。
```bash
git rebase main
```

3. **处理冲突**：如果 rebase 过程中遇到冲突，Git 会提示手动解决。解决冲突后执行：
```bash
git add <file>
git rebase --continue
```

4. **完成 rebase 后推送**：由于 rebase 会重写提交历史，推送时需要使用 `--force`。
```bash
git push --force
```

在推送到自己的 feature 分支之后，可以提交 pull request 将修改合并到 main 分支。

### 交互式 Rebase

git rebase -i（interactive rebase）是 Git 提供的一个交互式 rebase 功能，允许你在 rebase 过程中精细控制提交历史。它特别适合整理和优化提交历史，修改多个提交的顺序、内容，甚至合并、删除提交。

1. **执行交互式 rebase**：
在分支上使用 `git rebase -i`，并指定基准提交（基准是当前分支的父分支或任意提交），例如：
```bash
git rebase -i HEAD~3
```
这会打开一个文本编辑器，显示过去 3 次提交的列表：

```text
a1b2c3d Fix a bug
b2c3d4e Add new feature
c3d4e5f Improve documentation
```

`git rebase -i` 不仅可以使用 `HEAD~N` 指定一个范围，还可以直接指定一个具体的提交哈希（commit hash）作为基准，这样可以更灵活地选择需要操作的提交。

```bash
git rebase -i <commit-hash>
```

在这条命令中，`<commit-hash>` 是你想要作为基准的提交。所有位于该提交之后的提交都会进入交互式 rebase 编辑模式。值得注意的是，指定的 `<commit-hash>` 本身不会被修改，它只会作为 rebase 的起点。

假设你的提交历史如下：

```text
a1b2c3d Fix a bug
b2c3d4e Add new feature
c3d4e5f Improve documentation
d4e5f6g Initial commit
```

你想对最近的 3 个提交进行交互式 rebase，但基准设为 `d4e5f6g`（即最早的 `Initial commit`）。可以执行以下命令：

```bash
git rebase -i d4e5f6g
```

这将会打开编辑器，显示从 `c3d4e5f` 到 `a1b2c3d` 的提交列表供你编辑：

```text
a1b2c3d Fix a bug
b2c3d4e Add new feature
c3d4e5f Improve documentation
```

2. **编辑提交操作**：
每个提交前的 `pick` 表示 Git 将按顺序应用这些提交。可以将 `pick` 替换为以下命令：
- `pick`：保持提交不变。
- `reword`：修改提交信息。
- `edit`：修改提交的内容或信息。
- `squash`：将当前提交与前一个提交合并。
- `fixup`：类似 `squash`，但不保留当前提交的信息。
- `drop`：删除提交。

3. **保存并退出**：
编辑完提交列表后，保存文件并退出编辑器，Git 会根据你指定的命令逐步执行操作。

假设你有以下提交历史：
```text
pick a1b2c3d Fix a bug
pick b2c3d4e Add new feature
pick c3d4e5f Improve documentation
```
你可以将这些操作修改为：
```text
pick a1b2c3d Fix a bug
squash b2c3d4e Add new feature
fixup c3d4e5f Improve documentation
```
这会将后两个提交合并到第一个提交中，保持一个干净的历史记录。

### 处理冲突

如果在 rebase 过程中遇到冲突，Git 会暂停，并要求你解决冲突。解决冲突后，运行：
```bash
git add <conflict-file>
git rebase --continue
```
如果你想中止 rebase，可以运行以下命令：
```bash
git rebase --abort
```

### 参考资料

- [git rebase 用法详解与工作原理](https://waynerv.com/posts/git-rebase-intro/)
- [Git merge & rebase 区别和用法](https://www.youtube.com/watch?v=rYQ8uwwOb3M&ab_channel=%E7%9F%A5%E8%A1%8C%E5%B0%8F%E8%AF%BE)

## Git Merge

git merge 和 git rebase 命令类似，也是用于将一个分支的变更合并到当前分支。与 git rebase 保持历史记录清晰线性不同，git merge 会保留分支的历史记录并生成一个新的合并提交（merge commit）。

要将 master 分支合并到 feature 分支，以下是详细步骤和例子：
1. **切换到 feature 分支**：
```bash
git checkout feature
```
2. 执行 git merge 命令将 `master` 合并到 `feature`：
```bash
git merge master
```

如果两者的代码没有冲突，Git 会直接进行快速合并。 如果合并过程中有冲突，Git 会标记冲突的文件，并要求你手动解决冲突：

使用编辑器打开冲突文件，解决冲突后，将其标记为已解决：
```bash
git add <conflict-file>
```

继续合并过程：
```bash
git commit
```

### Git Rebase 和 Git Merge 的区别

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/git-merge-rebase.png)

git merge：
- 方式：将两个分支的变更合并，并创建一个新的合并提交（merge commit）。它保留了每个分支的原始提交历史。
- 结果：合并历史会显示出分叉点，并在合并时产生额外的 merge commit。

git rebase：

- 方式：将一个分支的提交重新应用到目标分支的最新状态。它会将你当前分支的提交“移到”目标分支之上，使提交历史变得线性。
- 结果：不产生新的 merge commit，提交历史更简洁、连续。

## 撤销修改

### 撤销工作区中的修改

如果你在工作目录中修改了文件，但尚未将其添加到暂存区，可以使用以下命令恢复到最近的提交状态：

```bash
git checkout -- <file-name>
# 撤销工作区中所有文件的修改
git checkout .
```

### 修改上一次提交（未推送到远程）

如果你只是想修改上一次提交的内容或提交信息，可以使用 `--amend` 选项。这不会真正撤销提交，而是允许你修改它。

```bash
git commit --amend
```

这会打开编辑器，你可以修改提交信息，也可以通过 `git add` 添加新的更改到该提交中。

### 撤销最后一次提交，但保留文件的更改和暂存

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202409212229078.png)

如果你已经提交了更改，但希望撤销提交并保留文件的更改在工作目录中（即不丢失工作内容），你可以使用 `git reset --soft`。

```bash
git reset --soft HEAD^
```

- **`--soft`**：将提交撤销，但保留所有修改在暂存区中，你可以重新提交。
- **`HEAD^`**：表示上一个提交（最后一次提交）。

这样提交会被撤销，但文件仍然保持已暂存状态，你可以根据需要修改或者重新提交。


### 撤销最后一次提交并保留修改但不暂存

如果你希望撤销提交，并且将所有文件的更改从暂存区移到工作目录中（即取消暂存），可以使用 `git reset --mixed`。 `--mixed` 是默认选项，可以省略。

```bash
git reset --mixed HEAD^
```

### 撤销最后一次提交并取消所有更改

如果你不仅想撤销提交，还想丢弃所有已提交的更改（即回到提交之前的状态），你可以使用 `git reset --hard`。注意，**这种方式会丢失更改**。

```bash
git reset --hard HEAD^
```

### 撤销已经推送到远程仓库的提交

如果你已经将提交推送到远程仓库，那么你撤销的操作会更加复杂，特别是在团队协作中，你需要谨慎操作。以下是几种方法：

#### 方法 1：使用 `git revert`

`git revert` 用来生成一个新的提交，它会反转某个提交的内容，不修改提交历史。适用于已经推送到远程的情况。

```bash
git revert <commit-hash>
```

- 这会生成一个新的提交，撤销指定的提交。

#### 方法 2：使用 `git reset` + 强制推送

你也可以使用 `git reset --hard` 撤销本地提交，然后强制推送到远程仓库。**注意：这会重写远程历史记录，可能会影响其他团队成员的工作，慎用**。

```bash
git reset --hard HEAD^
git push origin <branch-name> --force
```

### 参考资料

- [Git入门图文教程(1.5W字40图)](https://www.cnblogs.com/mq0036/p/17082938.html)



## 保持本地 Fork 仓库与上游仓库同步

### 设置上游仓库（只需要首次设置）

首先在 Github 上 fork 上游仓库。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20240802121219.png)

然后 clone fork 的仓库到本地。

```bash
# 本例中是 git clone https://github.com/cr7258/higress.git
git clone https://github.com/<your-github-user>/<repo>.git
cd <repo>
```

添加上游仓库作为远程仓库。

```bash
# 本例中是 git remote add upstream https://github.com/alibaba/higress.git
git remote add upstream https://github.com/<upstream>/<repo>.git
```

验证上游仓库是否添加成功。

```bash
git remote -v

# 示例输出
origin	https://github.com/cr7258/higress.git (fetch)
origin	https://github.com/cr7258/higress.git (push)
upstream	https://github.com/alibaba/higress.git (fetch)
upstream	https://github.com/alibaba/higress.git (push)
```

### 同步上游仓库的更新

获取上游仓库的更新。

```bash
git fetch upstream
```

将上游的更新 rebase 到本地分支。

```bash
git checkout main  # 切换到你要更新的分支，通常是 main 或 master
git rebase upstream/main  # 将上游的 main 分支 rebase 到本地的 main 分支
```

解决可能的冲突，如果有冲突，Git 会提示你处理冲突，处理完冲突后继续 rebase。

```bash
git rebase --continue
```

推送更新到你的 fork 仓库，如果使用了 rebase，需要强制推送。

```bash
git push -f origin main
```

## 使用 Git Worktree 管理多分支

git worktree 允许你在同一仓库中同时检出多个分支，从而方便并行开发和减少频繁的分支切换，提高开发效率。

### 创建一个新的 Worktree

```bash
# 方式一：基于当前分支，新建一个 worktree 目录，新的分支名就是新建目录的名称
git worktree add <path>
# 示例：假设当前在 feature-1 分支，那么执行以下命令会在项目目录平级（假设在项目根目录执行命令）的 feature-2 目录下基于 feature-1 分支创建一个 feature-2 分支
git worktree add ../feature-2

# 方式二：基于当前分支，新建一个 worktree 目录，新的分支名是指定的名称
git worktree add <path> -b <branch>

# 方式三：基于指定分支，新建一个 worktree 目录，新的分支名是指定的名称
git worktree add <path> -b <branch> <commit｜branch>
# 示例：假设当前在 feature-1 分支，那么执行以下命令会在项目目录平级（假设在项目根目录执行命令）的 feature-2 目录下基于 main 分支创建一个 feature-2 分支
git worktree add ../feature-2 -b feature-2 main
# 或者
git worktree add ../feature-2 main
```

### 列出 Worktree

```bash
git worktree list

# 输出示例
/Users/I576375/tmp/git-demo/higress        6f5c0f4 [new-feature-1]
/Users/I576375/tmp/git-demo/hotfix-1       210b97b [hotfix-1]
```

### 删除 Worktree

```bash
git worktree remove <worktree>

# 示例
git worktree remove hotfix-1
```

### 参考资料

- [Git Worktree 的使用](https://www.cnblogs.com/wellcherish/p/17220100.html)
