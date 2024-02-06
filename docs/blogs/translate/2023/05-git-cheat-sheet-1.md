---
title: Git 速查表：初学者必备的 12 个 Git 命令
author: Se7en
date: 2023/09/01 22:00
categories:
 - 翻译
tags:
 - Git
---

# Git 速查表：初学者必备的 12 个 Git 命令

> 本文译自：Git Cheat Sheet: 12 Essential Git Commands For Beginners<br>
> 原文链接：https://initialcommit.com/blog/Git-Cheat-Sheet-Beginner<br>
> 本系列共有三篇文章，本文是第一篇：
> - Git Cheat Sheet: 12 Essential Git Commands For Beginners（本文）
> - Git Cheat Sheet: 12 Essential Git Commands For Intermediate Users
> - Git Cheat Sheet: 14 Essential Git Commands For Experts

## 介绍

Git 是世界上最流行的版本控制系统（VCS），很难想象开发人员没有它会是什么样子。现在，绝大多数开发人员，包括个人和大公司，都在项目中选择 Git。

对于初学者来说，第一个问题就是如何使用 Git？

在本文中，我将介绍 12 个对初学者特别重要的 Git 命令。您可以将本篇文章作为 Git 命令的速查表，以便在以后查找使用。

现在让我们开始吧。

## git init

这可能是你创建新项目时要使用的第一个命令。它用于初始化一个新的、空的 Git 仓库。使用这个命令的语法非常简单：

```bash
git init
```

执行 `git init` 命令后，Git 会在当前目录下创建一个名为 `.git` 的子目录，这个子目录包含 Git 用来跟踪版本控制所需的所有文件和目录。具体来说，包括以下文件和目录：
-   `HEAD` 文件：存储当前位置指针，指向当前工作区的分支。
-   `config` 文件：存储仓库的配置信息，比如远程仓库的 URL ，你的邮箱和用户名等。
-   `description` 文件：供 Gitweb 使用，显示仓库的描述。
-   `hooks` 目录：保存在执行 Git 命令时触发的自定义 hooks 脚本。
-   `info` 目录：用于排除提交规则，与 .gitignore 功能类似。他们的区别在于.gitignore 这个文件本身会提交到版本库中去，用来保存的是公共需要排除的文件；而 info/exclude 这里设置的则是你自己本地需要排除的文件，他不会影响到其他人，也不会提交到版本库中去。
-   `objects` 目录：Git 的对象数据库。
-   `refs` 目录：存储着分支和标签的引用。
-   `index` 文件：用于追踪文件的更改。
-   `logs` 目录：用于记录操作信息。

## git clone

通常情况下，你已经有一个现有的 Git 仓库（有时托管在像 GitHub 或 Bitbucket 这样的网站上），并希望将其复制到本地计算机。在这种情况下，你需要使用的命令是 `git clone`。简单来说，这个命令用于创建现有仓库的副本或克隆：

```bash
git clone [url-to-existing-git-repo]
```

## git status

Git 会持续监控您的项目工作目录中的变化，这些变化可能涉及创建新文件、添加文件以进行跟踪、删除文件、更改文件权限、修改文件名或内容等。您可以使用 git status 命令，查看 Git 在某个特定时间所记录的变化情况。

```bash
git status
```

## git add

一旦在您的工作目录中对文件做出更改并通过 git status 命令确认更改完全正确，就可以将这些变化添加到 Git 的暂存区中。

您可以使用 git add 命令将单个文件添加到暂存区：

```bash
git add <your-file-name>
```

或者，如果您有多个更改的文件，您可以使用 -A 选项将它们全部添加到暂存区：

```bash
git add -A
```

另外，您也可以使用单个点号代替 -A 选项：

```bash
git add .
```

## git commit

一旦您的更改已经被暂存，就可以使用 git commit 命令将这些更改保存到 Git 仓库中。一个 Git commit 是一组文件更改，作为一个单元存储在 Git 中。

在此过程中，您应该提供一个清晰明确的提交信息，以便其他开发者能够轻松理解其目的：

```bash
git commit -m "some useful comment about your change"
```

一个常见的经验法则是使用祈使语气编写提交信息。

下面是一张图片，帮助您更好地理解 Git 中更改是如何从工作目录流转到暂存区，最终提交到仓库的：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20230427184046.png)

## git branch

您可以将 Git 分支看作是一系列提交或开发历程。实际上，分支名称只是一个指向特定 commit ID 的标签。每个 commit ID 都链接回其父 commit ID，形成了一条开发历史链。

git branch 命令就像一把瑞士军刀，它可以展示当前 Git 仓库中的所有分支。带有星号标记的分支是您当前所在的分支：

```bash
git branch
```

要创建一个新分支，只需使用以下命令并指定您的新分支名称即可：

```bash
git branch <new-branch-name>
```

## git checkout

使用 git checkout 命令可以在不同的分支之间进行切换，它会更新您的工作目录以反映所选分支的最新版本：

```bash
git checkout <name-of-branch>
```

此外，git checkout 命令还可以同时创建一个新分支并切换到该分支：

```bash
git checkout -b <name-of-branch>
```

## git merge

那么，您已经在新分支上进行了多次提交，完成了您的工作。接下来该怎么做呢？

通常情况下，这些更改应该合并回主代码分支（默认情况下通常称为 master 分支）。我们可以使用 git merge 命令来完成合并操作。

```bash
git merge <branch-to-merge-from>
```

请注意，git merge 命令将指定分支中的提交合并到当前所在的分支中。因此，在运行该命令之前，您需要首先切换到要合并的分支上。

## git push

到目前为止，我们运行的所有命令都只影响了本地环境。现在，是时候通过使用 git push 命令将您最新提交的更改推送到远程仓库（通常托管在 GitHub 和 Bitbucket 等网站上）与其他开发者分享了：

```bash
git push <remote> <name-of-branch>  
```

例如：

```bash
git push origin master
```

在该示例中，我们将 master 分支推送到名为 origin 的远程仓库（在 Git 中是远程仓库的默认名称）。

一旦您推送了更改，其他团队成员就可以看到它们、审查它们并将它们拉取到他们自己的本地 Git 仓库副本中。

## git pull

git pull 命令与 git push 命令正好相反。您可以使用它将其他开发者所做的更改下载到您的本地仓库中：

```bash
git pull <remote> <name-of-branch>
```

上述命令将下载远程仓库中指定分支的新提交，并尝试将它们合并到您本地的该分支副本中。实际的命令将类似以下示例，使用 origin 远程仓库和 master 分支：

```bash
git pull origin master
```

有趣的是，git pull 命令实际上只是 git fetch 命令和 git merge 命令的组合。其中，git fetch 命令用于将远程分支下载到本地仓库，而 git merge 命令用于将已下载的分支合并到本地副本中。

## git log

如果您想查看 Git 分支上所有提交的历史记录，可以使用 git log 命令。git log 命令按时间顺序显示所有提交的有序列表，包括作者、日期和提交信息，从最新到最旧：

```bash
git log
```

若要按从旧到新的顺序列出提交，请使用 --reverse 选项：

```bash
git log --reverse
```

如果您是一个视觉化的人，可以尝试使用以下命令选项，在终端中显示提交历史的图形化表示：

```bash
git log --all --graph --decorate
```

这对于查看分支在开发过程中如何分叉和合并回来非常有用。

## git stash

有时候，您在工作目录中修改了一些文件，但是意识到需要先处理其他事情。然而，您又不想丢失已经完成的工作。在这种情况下，可以使用 git stash 命令将所有未提交的更改保存在工作目录中，以便稍后可以找回它们。

```bash
git stash
```

使用 git stash 命令后，您的工作副本将被清理（所有更改将消失）。但是不要担心，它们并没有丢失，git stash 只是将这些更改放在临时存储中，您可以使用 git stash pop 命令找回它们：

```bash
git stash pop
```

在这里，pop 子命令将重新应用存储在 stash 中的最后一个状态，以便您可以继续上次的工作。

## 总结

在本文中，我讨论了初学者必备的 12 个 Git 命令，您可以将本篇文章作为 Git 速查表，在以后的参考中使用。


## 欢迎关注

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220104221116.png)
