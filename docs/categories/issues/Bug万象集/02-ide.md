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

### Cmd + 点击无法跳转到函数定义

按下 F1 键，输入 "settings json"，然后点击 "Open User Settings (JSON)"，然后修改以下内容：

```json
{
    "editor.multiCursorModifier": "alt",
}
```

参考资料：https://forum.cursor.com/t/cmd-click-not-working-to-jump-to-function-definition-in-cursor/23438/8
