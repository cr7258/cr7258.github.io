---
title: Golang 速查手册
author: Se7en
date: 2025/07/20 22:00
categories:
 - 个人速查手册
tags:
 - golang
---

# Golang 速查手册

## Go Modules 使用 replace 替换为特定分支或 commit

 **使用场景**：你 fork 了一个项目，并在 fork 仓库中创建了一个新分支（例如 `ai-search-embedding`）。你希望在自己的项目中使用这个分支的代码，来替代原模块的依赖。

- `replace` 指令表示：将依赖替换为 `github.com/cr7258/wasm-go` 仓库中的 `ai-search-embedding` 分支。
- 引用这个依赖的路径仍然是 `github.com/higress-group/wasm-go`，不需要修改。

```go
module my-app

go 1.22

require (
    github.com/higress-group/wasm-go v1.0.0
)

replace github.com/higress-group/wasm-go => github.com/cr7258/wasm-go ai-search-embedding
```

然后执行 `go mod tidy` 会自动拉取 `ai-search-embedding` 分支的代码，并使用自动生成的伪版本号，例如：

```go
replace github.com/higress-group/wasm-go => github.com/cr7258/wasm-go v0.0.0-20250720141620-d990a8c7de91
```
