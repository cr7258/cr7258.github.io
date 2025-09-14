---
title: MacOS 速查手册
author: Se7en
date: 2025/08/17 22:00
categories:
 - 个人速查手册
tags:
 - MacOS
---

# MacOS 速查手册

## 允许运行非 App Store 或未签名的应用

macOS 的 Gatekeeper 会阻止非 App Store 或未签名的应用，例如会出现如下所示的提示：

```bash
xxx Is Damaged and Can’t Be Opened. You Should Move It To The Trash.
```

可以运行以下命令允许运行非 App Store 或未签名的应用：

```bash
# 把 xxx.app 换成你的应用路径
xattr -cr /Applications/xxx.app
```

## 显示隐藏文件

使用以下快捷键就可以显示隐藏文件：

```bash
Command + Shift + .
```