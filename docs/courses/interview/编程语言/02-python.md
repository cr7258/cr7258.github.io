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
