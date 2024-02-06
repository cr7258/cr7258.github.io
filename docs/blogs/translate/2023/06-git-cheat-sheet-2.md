---
title: Git 速查表：中级用户必备的 12 个 Git 命令
author: Se7en
date: 2023/09/01 22:00
categories:
 - 翻译
tags:
 - Git
---

# Git 速查表：中级用户必备的 12 个 Git 命令

> 本文译自：Git Cheat Sheet: 12 Essential Git Commands For Intermediate Users<br>
> 原文链接：https://initialcommit.com/blog/git-cheat-sheet-intermediate<br>
> 本系列共有三篇文章，本文是第二篇：
> - Git Cheat Sheet: 12 Essential Git Commands For Beginners
> - Git Cheat Sheet: 12 Essential Git Commands For Intermediate Users（本文）
> - Git Cheat Sheet: 14 Essential Git Commands For Experts

在之前的文章中，我们讨论了一些初学者必备的 Git 命令。然而，这些命令仅仅触及了 Git 功能的皮毛。

在本篇文章中，我们将介绍中级用户必备的 12 个 Git 命令。

## git config

git config 命令用于设置 Git 配置。使用这个命令，用户可以在三个不同级别设置配置：

-   本地级别：在特定的 Git 仓库中（存储在项目根目录的 .git/config 文件中）。
-   全局级别：针对操作系统中的当前用户。
-   系统级别：针对操作系统中的所有用户。

默认情况下，git config 命令会更改本地级别的设置。此命令可用于设置诸如 Git 用户名、电子邮件地址、默认文本编辑器（如 Vim）、默认合并行为、终端输出外观和别名等信息。

例如，可以使用以下命令设置当前用户的名称和电子邮件：

```bash
git config --global user.name "Your Name"
git config --global user.email "name@example.com"
```

可以使用以下命令将 Git 的默认文本编辑器设置为 Vim：

```bash
git config --global core.editor "vim"
```

列出所有当前 Git 的配置：

```bash
git config --list --show-origin
```

## git mv

git mv 命令用于在 Git 仓库中移动和/或重命名文件。该命令会在工作目录中移动文件，并更新 Git 索引中旧文件路径和新文件路径。

```shell
git mv path/to/old_file_name.ext path/to/new_file_name.ext
```

需要注意的是，文件在您的文件系统中也会被重命名/移动，所以这个命令一举两得。然而，旧文件的历史记录都被 Git 跟踪了，所以如果您发现需要旧版本，可以随时找回。

## git rm

git rm 命令用于从 Git 仓库中删除文件。它会在工作目录中删除文件，并从 Git 索引中移除文件。

要删除特定文件：

```shell
git rm path/to/filename.ext
```

需要注意的是，此命令会从您的文件系统中删除文件。然而，已删除文件的历史记录仍被 Git 跟踪，所以如果您后来发现需要它，可以随时找回。

## git diff

git diff 命令用于显示提交、分支以及其他代码状态之间的差异。默认情况下，git diff 显示工作树与暂存区之间的差异。

该命令还可用于比较分支之间的差异：

```shell
git diff branch1 branch2
```

或者用于比较两个提交之间的差异：

```shell
git diff commitID1 commitID2
```

为了比较一个特定文件，也可以加上第三个文件名参数：

```shell
git diff commitID1 commitID2 file_to_compare.ext
```

## git reset

git reset 命令用于将分支恢复到先前的状态。当给出提交、分支或其他引用时，该命令将分支和 HEAD 引用移动到指向该引用的位置。如果未提供引用参数，则默认将引用指向 HEAD。

该命令提供了三种操作模式：soft, mixed，和 hard。使用 soft 选项时，索引会被更新，但暂存的提交和工作目录保持不变。使用 mixed 选项（默认选项）时，索引将被重置，已暂存的更改将被移回工作目录。使用 hard 选项时，索引和工作目录都会被重置，所有更改都将丢失。

要将暂存区重置为与最近的提交匹配，而不丢失工作区的任何数据，请使用以下命令：

```shell
git reset
```

撤销所有当前的更改并将工作区重置为与最近的提交匹配，请使用以下命令：

```shell
git reset --hard
```

## git tag

git tag 命令用于创建一个人类可读的标签（例如版本号），用于引用存储库中特定的提交。标签在本质上是一个引用，类似于分支名称，但标签通常是静态的，因为它们指向单个提交，而分支名称是动态的，因为它们跟踪分支的末端，并随着新的提交添加而更新。通常情况下，标签在标记发布版本时很有用。

为当前签出的 Git 提交创建一个标记：

```shell
git tag tag_name
```

##  git rebase

Git rebase 命令允许用户将一系列提交移动到一个新的基础提交上。如果用户提供了一个引用参数，则该分支将在该分支上进行 rebase。否则，默认情况下，该分支将在远程分支上进行 rebase。

```shell
git rebase origin
```

通过在 rebase 命令中添加 -i 选项，用户可以执行交互式 rebase。在交互式 rebase 中，用户还可以组合、拆分、重新排序、删除和编辑提交记录。

## git cherry-pick

git cherry-pick 命令接受一个或多个提交记录，并将它们应用到一个现有的分支上。该命令提供了一种快速将提交记录添加到多个分支的方式，而无需执行 rebase 操作。

要将单个提交记录选取并应用到当前分支上，可以执行以下操作：

```shell
git cherry-pick commitID
```

用户也可以选取一系列提交记录并将它们应用到分支上。默认情况下，cherry-pick 不包含第一个提交记录，但会包含最后一个提交记录。

```shell
git cherry-pick oldest_commit...newest_commit
```

要让 cherry-pick 命令包含第一个和最后一个提交记录，可以将命令更新如下：

```shell
git cherry-pick oldest_commit^...newest_commit
```

## git bisect

git bisect 命令用于通过对提交历史记录进行二分查找来分离出特定的提交记录。该命令在帮助我们找出是哪个提交引入了 bug 时非常有用。

要运行这个命令，需要先找到一个问题未发生的过去提交记录，这里称之为 "good_commit_id"。然后在最近的分支上运行以下命令：

```shell
git bisect start
git bisect bad
git bisect good good_commit_id
```

Git 会对提交记录进行二分查找，它会检查当前提交和上一个好的提交之间的提交记录。此时，开发人员需要检查或测试代码，以确定 bug 是否仍然存在。如果 bug 仍然存在，则运行 git bisect bad 命令；如果 bug 不存在，则运行 git bisect good 命令。

一旦找到了引入 bug 的提交记录，搜索就会返回第一个坏的提交记录的 commit ID。从这里开始，用户可以检查引入 bug 的提交记录。然后可以使用 git bisect reset 命令将分支恢复到执行搜索之前的状态。

这为开发人员快速追踪 bug 的源头提供了一种方法，因为每次将提交历史记录分成两半，可以指数级地减少需要手动检查的提交记录数量。

## git revert

git revert 命令用于撤消之前提交的更改。该命令接受一个 commit ID，然后在当前分支上创建一个新的提交记录，以反转 revert 提交记录中的更改。这种方法允许用户撤消一个更改，而无需重写历史记录。执行该命令将在分支的末尾产生一个新的提交记录，用于撤消 revert 的提交记录中的更改。

```shell
git revert commitID
```

## git fetch

git fetch 命令用于从远程仓库下载引用（包括标签和分支）。它会下载新创建的引用，并完成本地已存储引用的历史记录。与 git pull 不同，git fetch 命令不会更新本地仓库的工作状态，也不会执行合并操作。默认情况下，git fetch 命令会获取当前仓库的所有引用。

要从远程仓库获取所有引用，请使用以下命令：

```shell
git fetch origin
```

要从特定分支获取引用，请使用以下命令：

```shell
git fetch origin branch_name
```

## git blame

通过 git blame 命令，用户可以查看文件中每一行最后一次修改的时间以及进行修改的责任人。该工具对于理解文件的历史记录非常有用，可以帮助用户确定在代码更改方面应该向谁寻求问题或建议。

要查看特定文件的此信息，请使用以下命令：

```shell
git blame path/to/filename.ext
```

## 总结

虽然在使用 Git 的最基本级别时不需要这些中级命令，但它们可以帮助用户提高使用 Git 的效率。它们提供了一组强大的功能，可以帮助您成为一个全面发展的开发者，这通常意味着能够以创造性的方式解决问题。

## 欢迎关注

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220104221116.png)
