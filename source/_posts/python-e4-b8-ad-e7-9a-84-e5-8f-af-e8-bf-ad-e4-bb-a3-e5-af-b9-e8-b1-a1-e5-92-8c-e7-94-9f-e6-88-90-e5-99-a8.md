---
title: Python中的可迭代对象和生成器
url: 130.html
id: 130
categories:
  - Python
date: 2018-05-27 15:47:18
tags:
---

可迭代对象
-----

当我们创建一个列表后，我们可以遍历这个列表来进行读取其中的元素，列表便是一个可迭代对象：

    test_list = [1, 2, 3, 4]
    for test_item in test_list:
        print(test_item)
    
    1
    2
    3
    4
    

当我们使用列表生成式来建立列表时，也可以建立一个可迭代对象：

    test_list = [x*2 for x in range(4)]
    for test_item in test_list:
        print(test_item)
    
    0
    2
    4
    6
    

对于我们可以使用 `for .. in ..`语法的对象便叫做一个迭代器。像列表，字符串等等，由于它们的内容都是存储在内存中的，因此我们可以通过 `for .. in ..` 方式来进行多次读取。但是如果我们有大量数据呢？

生成器
---

生成器也是可以迭代的，但是它只可以被读取一次。因为它的值并不是在内存中，而是实时地生成数据：

    test_generator = (x*2 for x in range(4))
    for test_item in test_generator:
        print(test_item)
    
    0
    1
    4
    6
    

这种形式便叫做生成器。我们生成的test_generator只能被遍历（其实不是遍历）一次。当我们使用 `for ... in ..` 时，生成器会先计算0，然后1，接着4，6...并没有在我们遍历前就把元素生成放在内存中。当我们的数据量比较大时，这样便可以节省内存。

yield
-----

yield 类似于 return ，只不过它返回的是个生成器。

    def create_generator():
        test_list = range(4)
        for test_item in test_list:
            yield test_item*2
    
    test_generator = create_generator()
    print(test_generator)
    <generator object create_generator at 0x10d6ebfc0>
    
    for i in test_generator:
        print(i)
    
    0
    1
    4
    6
    

当我们输出test\_generator时，可以发现并不像输出列表一样将它的元素都打印出来，而是返回来一个对象的地址值，这里的test\_generator是一个Object对象。只有当我们遍历的时候，它才会将元素逐个计算出来。 当我们调用yield函数时，yield后面的代码并不会立马执行，它只会返回一个生成器对象。当我们使用 `for ... in ...`时，才会开始逐步执行。