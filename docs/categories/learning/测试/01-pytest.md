---
title: Pytest
author: Se7en
categories:
 - Test
tags:
 - Test
---

# Pytest 测试框架

## Pytest 测试用例发现规则

Pytest 以特定规则识别测试用例，所以测试用例文件、测试类以及类中的方法、测试函数这些命名都必须符合规则，才能被 Pytest 识别到并加入测试运行队列中。如果不遵循 Pytest 的命名规则会导致 Pytest 识别不到测试用例。

| 类型       | 规则                              |
| ---------- | --------------------------------- |
| 文件       | `test_` 开头或 `_test` 结尾       |
| 类         | `Test` 开头                       |
| 方法/函数  | `test_` 开头或 `_test` 结尾         |

注意：

- 测试类中不可以添加 `__init__` 构造函数。
- 上述表格内的规则全部同时满足的方法或函数才能被自动发现。


```python
# 文件名
# 示例：test_example.py

# 类名
class TestExample:
    # 方法名
    def test_case1(self):
        pass

    def test_case2(self):
        pass

# 函数名
def test_addition():
    pass

def test_subtraction():
    pass

```

## Fixture

在 pytest 中，fixture 是一种用于为测试用例提供可重用资源或设置环境的机制。fixture 可以帮助你在测试前后执行初始化或清理操作，比如设置数据库连接、创建临时文件、准备测试数据等。

### 传参调用

在测试用例参数中直接传入 fixture 名，pytest 会自动寻找、调用对应的 fixture，并返回其结果。

```python
import pytest

@pytest.fixture
def sample_data():
    return [1, 2, 3]

def test_length(sample_data):
    assert len(sample_data) == 3
```
 
 ### 手动调用 usefixtures

通过 `@pytest.mark.usefixtures("fixture_name")` 标记测试类或方法，手动调用 fixture，但不能直接获得返回值，主要用于 setup/teardown。

```python
import pytest

@pytest.fixture()
def demo_fixture():
    print("Preparing data")

@pytest.mark.usefixtures("demo_fixture")
def test_demo():
    print("Test case execution")

# 输出结果
Preparing data
Test case execution
```