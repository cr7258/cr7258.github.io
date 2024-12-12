---
title: IDE
author: Se7en
date: 2024/12/12 10:00
categories:
 - IDE
tags:
 - IDE
---

# IDE (Integrated Development Environment)

## VS Code

### Failed to find the "go" binary from PATH

打开 Settings，搜索 goroot。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202412121031940.png)

编辑 settings.json 配置文件。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202412121031061.png)

将 Go 的安装目录路径填入 `go.goroot`。

```bash
ls /Users/I576375/software/go/go1.23.1/
CONTRIBUTING.md PATENTS         SECURITY.md     api             codereview.cfg  go.env          misc            src
LICENSE         README.md       VERSION         bin             doc             lib             pkg             test
```

参考资料：https://github.com/golang/vscode-go/issues/971/
