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
