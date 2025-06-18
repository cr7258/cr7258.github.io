---
title: Python
author: Se7en
categories:
  - Interview
tags:
  - Python
---

## Python 类方法、实例方法、静态方法、抽象方法

### 方法类型对比表格

| 方法类型            | 装饰器               | 第一个参数      | 调用方式   | 可访问内容               | 应用场景            |
| --------------- | ----------------- | ---------- | ------ | ------------------- | --------------- |
| Instance Method | 无                 | `self`     | 实例调用   | 实例属性、实例方法、类属性、类方法   | 实现实例的行为逻辑       |
| Class Method    | `@classmethod`    | `cls`      | 类或实例调用 | 类属性、类方法             | 工厂方法、修改类级状态或行为  |
| Static Method   | `@staticmethod`   | 无          | 类或实例调用 | 无法访问类或实例上下文，仅使用传入参数 | 工具函数、与类相关但不依赖状态 |
| Abstract Method | `@abstractmethod` | 通常为 `self` | 子类中实现  | 定义接口（通常访问实例）        | 统一接口、强制子类实现方法   |

### 实例方法（Instance Method）

实例方法是最常见的方法类型，用于访问和操作实例属性，定义实例行为。必须通过实例对象调用。

```python
class Dog:
    def __init__(self, name):
        self.name = name

    def bark(self):  # 实例方法
        return f"{self.name} says woof!"

# 创建不同的实例
dog1 = Dog("Buddy")
dog2 = Dog("Charlie")

# 调用相同的实例方法，输出不同结果
print(dog1.bark())  # 输出：Buddy says woof!
print(dog2.bark())  # 输出：Charlie says woof!
```

### 类方法（Class Method）

类方法作用于类本身，常用于访问类变量或创建工厂方法。类方法可通过类或实例调用。

```python
class Dog:
    count = 0  # 类变量

    def __init__(self, name):
        self.name = name
        Dog.count += 1

    @classmethod
    def get_count(cls):  # 类方法
        return f"Total dogs: {cls.count}"

Dog("Buddy")
Dog("Charlie")
print(Dog.get_count())  # 输出：Total dogs: 2
```

### 静态方法（Static Method）

静态方法不依赖类或实例的状态，适合实现与类逻辑相关但不需要上下文的工具方法。

```python
class Dog:
    @staticmethod
    def bark_sound():  # 静态方法
        return "woof!"

print(Dog.bark_sound())  # 输出：woof!
```

### 抽象方法（Abstract Method）

抽象方法是接口设计的一部分，必须由子类实现，适合用于统一多个子类的行为结构。

```python
from abc import ABC, abstractmethod

class Animal(ABC):
    @abstractmethod
    def speak(self):  # 抽象方法
        pass

class Dog(Animal):
    def speak(self):
        return "Woof!"

class Cat(Animal):
    def speak(self):
        return "Meow!"

dog = Dog()
cat = Cat()

print(dog.speak())  # 输出：Woof!
print(cat.speak())  # 输出：Meow!
```

### 方法之间的调用关系示例

```python
class MyClass:
    def instance_method(self):
        return "This is an instance method"

    @classmethod
    def class_method(cls):
        obj = cls()  # 类方法中调用实例方法，必须先创建实例
        return obj.instance_method()

    @staticmethod
    def static_method():
        return "This is a static method"

    def call_class_from_instance(self):
        return self.__class__.class_method()

    def call_static_from_instance(self):
        return MyClass.static_method()

print(MyClass.class_method())                   # 输出：This is an instance method
print(MyClass().call_class_from_instance())     # 输出：This is an instance method
print(MyClass().call_static_from_instance())    # 输出：This is a static method
```

✅ 总结调用关系：

| 调用关系        | 是否支持          | 示例                                   |
| ----------- | ------------- | ------------------------------------ |
| 实例方法 → 实例方法 | ✅ 支持          | `self.other_method()`                |
| 实例方法 → 类方法  | ✅ 支持          | `self.__class__.class_method()`      |
| 实例方法 → 静态方法 | ✅ 支持          | `ClassName.static_method()`          |
| 类方法 → 类方法   | ✅ 支持          | `cls.other_class_method()`           |
| 类方法 → 实例方法  | ❌ 直接不行，需先创建实例 | `obj = cls(); obj.instance_method()` |

## Python 中 `is` 与 `==` 的区别

`==` 是值比较，判断两个对象的值是否相等（内容相同）。

```python
a = [1, 2, 3]
b = [1, 2, 3]
print(a == b)  # True，内容相同
```

`is` 是引用比较，判断两个变量是否引用同一个对象（内存地址相同）。

```python
a = [1, 2, 3]
b = [1, 2, 3]
print(a is b)  # False，虽然内容一样，但是不同对象
```

## Python 中的装饰器是什么？有哪些使用场景？

装饰器本质上是一个函数，它接受一个函数作为参数并返回一个新函数。通过使用 `@` 符号，我们可以将装饰器应用于任何函数。

```python
def my_decorator(func):
    def wrapper():
        print("Something is happening before the function is called.")
        func()
        print("Something is happening after the function is called.")
    return wrapper

@my_decorator
def say_hello():
    print("Hello!")

say_hello()

# 输出结果
Something is happening before the function is called.
Hello!
Something is happening after the function is called.
```

Python 装饰器有许多应用场景，例如：记录日志、错误处理、性能测试、输入验证等。

```python
# 日志记录
def log_decorator(func):
    def wrapper(*args, **kwargs):
        print(f"{func.__name__} was called")
        return func(*args, **kwargs)
    return wrapper

@log_decorator
def add(x, y):
    return x + y

# 错误处理
def error_handling_decorator(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            print(f"Error occurred: {e}")
    return wrapper

@error_handling_decorator
def divide(x, y):
    return x / y
```

参考资料：[Python装饰器的10个应用场景](https://blog.csdn.net/CSDN_224022/article/details/137639653)

## Python 中列表和元组的区别？

在 Python 中，**列表（list）** 和 **元组（tuple）** 都是用于存储数据项的**序列类型**，但它们的**主要区别在于可变性**：

* **列表是可变的**：可以修改、添加、删除元素；
* **元组是不可变的**：创建后内容不可更改。

列表（list）的主要特性如下：

* **可变性**：支持增、删、改操作，元素值可以被修改。
* **表示方式**：使用方括号 `[]`。
* **适用场景**：适合需要频繁修改的场景，如数据处理、动态集合等。

```python
lst = [1, 2, 3]
lst[0] = 100      # 修改元素
lst.append(4)     # 添加元素
```

元组（tuple）的主要特性如下：

* **不可变性**：元素值和数量在创建后不可更改。
* **表示方式**：使用圆括号 `()`。
* **适用场景**：适合表示固定数据结构，如坐标 `(x, y)`，或作为字典键使用（必须不可变）。

```python
tup = (1, 2, 3)
# tup[0] = 100    # ❌ TypeError，不可修改
```

## Python 如何调用 Shell 语言？

使用 Python 调用 shell 命令的常见方法有三种：

1. 最简单的方法是 `os.system()`，它会直接把命令的输出打印到终端，**可以看到输出**，但程序**无法获取这些输出或处理错误**，控制力很弱：

```python
import os
os.system("ls -l")
```

适合临时调试，但无法获取结果、判断执行状态或做进一步处理，不推荐用于生产环境。

2. 使用 `subprocess.run()` 可以获取命令输出，但命令执行期间会阻塞，直到命令完成后一次性返回所有输出，**不支持实时输出**：

```python
import subprocess

result = subprocess.run(["ping", "-c", "4", "www.baidu.com"], capture_output=True, text=True)
print(result.stdout)
```

适合执行一次性命令，并在结束后查看结果，但不适合需要“边执行边输出”的场景。

3. 使用 `subprocess.Popen()` 可以边执行命令边读取输出，**不会阻塞程序**，也**支持流式实时打印**，非常适合持续输出的命令（如 `ping`、`tail -f`）：

```python
import subprocess

p = subprocess.Popen(["ping", "-c", "4", "www.baidu.com"], stdout=subprocess.PIPE, text=True)

for line in p.stdout:
    print(line.strip())
```

`Popen()` 适合长时间运行、实时日志、交互式命令等高级需求，灵活性最强。

## Python 字符串反转

Python 字符串反转的常用方法如下：

**1. 字符串切片法（最常用）**

```python
s = "Hello"
reversed_s = s[::-1] # 从末尾到开头，每次倒着取 1 个字符，即完成字符串反转。
print(reversed_s)  # 输出：olleH
```

这种方法简洁高效，是推荐做法。

**2. 使用 reversed() 和 join()**

```python
s = "Hello"
reversed_s = ''.join(reversed(s))
print(reversed_s)  # 输出：olleH
```
这种方法可读性好，但效率略低于切片法。

**3.循环拼接法**

```python
s = "Hello"
reversed_s = ''
for char in s:
    reversed_s = char + reversed_s
  print(reversed_s)  # 输出：olleH
```

效率较低，不推荐。

**4.列表法**

先转为列表，用 reverse() 方法，再 join。

```python
s = "Hello"
l = list(s)
l.reverse()
reversed_s = ''.join(l)
print(reversed_s)  # 输出：olleH
```

这种方法不适用于长字符串，效率较低。

## Python 怎么调用父类方法？

Python 中调用父类方法主要有以下几种方式：

**1. 使用 `super()` 函数（推荐）**

Python 的 `super()` 函数是一个内置函数，用于调用父类(超类)的方法。

```python
class Parent:
    def say(self):
        print("Parent says hello")

class Child(Parent):
    def say(self):
        super().say()  # 调用父类的say方法
        print("Child says hello")

c = Child()
c.say()

# 输出
Parent says hello
Child says hello
```

在多重继承中，`super()` 会按照 MRO（Method Resolution Order，方法解析顺序）向后查找并调用下一个类的方法。

```python
class A:
    def say(self):
        print("A")

class B(A):
    def say(self):
        print("B")
        super().say()

class C(A):
    def say(self):
        print("C")
        super().say()

class D(B, C):
    def say(self):
        print("D")
        super().say()

d = D()
d.say()

# 输出
D
B
C
A
```

**2. 使用父类名调用**

直接通过父类名调用方法，需要将 `self` 作为第一个参数传入。

**示例：**

```python
class Parent:
    def say(self):
        print("Parent says hello")

class Child(Parent):
    def say(self):
        Parent.say(self)  # 显式调用父类方法
        print("Child says hello")
```

在多继承时，`super()` 会根据方法解析顺序（MRO）调用父类方法。如果需要调用多个父类的方法，有时需要显式用父类名调用：

```python
class ParentA:
    def say(self):
        print("ParentA says hello")

class ParentB:
    def say(self):
        print("ParentB says hello")

class Child(ParentA, ParentB):
    def say(self):
        ParentA.say(self)  # 调用ParentA的say
        ParentB.say(self)  # 调用ParentB的say

c = Child()
c.say()

# 输出
ParentA says hello
ParentB says hello
```
