---
title: 使用XPath定位HTML元素
url: 60.html
id: 60
categories:
  - Python
date: 2018-05-20 15:46:21
tags:
---

> XPath是非常简洁，非常优雅的一种确定HTML元素的方式。

基本介绍
----

对于XPath的定位，主要有两种方式：

    如果一个条件后面附加的是 【 / 】， 则表示下一步要匹配的节点在下一层。如果一个条件后面附加的是 【 [] 】，则表示下一步要匹配的节点在本层，但是会过滤掉一些不满足条件的节点。
    

比如：

    /foo/bar
    

1.  从root节点开始
2.  /foo ：对于任意一个节点（目前是仅是root节点，/ 表示从root节点开始，//表示从任意位置节点开始），获取它的子节点（在这里，root节点总是确定的），检查哪些子节点是 foo 元素，并把这些子节点作为一个新的集合。
3.  /bar ：对于第2步中新的集合中的每一个节点，获取它的子节点，检查这些子节点哪些是bar元素，并将它们放到新的集合中。此集合中的元素就是我们要获取的对象。

    /foo[bar]
    

1.  从root节点开始
2.  /foo ：对于任意一个节点（目前仅是root节点，同上），获取它的子节点，检查这些子节点中哪些是foo元素，将这些子节点放到一个新的集合中。
3.  \[bar\] ：对于第2步中新的集合中的每一个节点，获取它的子节点，检查这些子节点中是否有bar元素，如果没有，则将此节点舍弃（此节点代表第2步中集合中的节点）。此集合中的元素就是我们要获取的对象。

以上两种方式基本确定了XPath的使用规则，最后，还有一个用 axis 【 :: 】作为前缀分隔的方式，这种axis明确指定了在检查条件前是哪些节点集合应该被选择。 比如：

    /foo/following-sibling::bar
    

1.  以root节点开始
2.  /foo ：对于任意一个节点，获取它的子节点，检查哪些子节点是foo元素，把这些节点放入一个新的集合。
3.  /following-sibling::bar ：对于第2步中集合中的任意一个节点，获取它所有的兄弟节点，检查哪些是bar元素，然后将它们放入新的集合。此集合中的元素就是我们要获取的对象。

特别地，对于当前节点的子节点是没有必要声明的，即 child:: 这种是默认的方式（不必要写，写了当然也没错）。因此，我们上面提到的

    /foo/bar 和 /foo[bar] 实际上分别代表： /child::foo/child::bar  和 /child::foo[child::bar]
    

通过比较这些表达式以及它们所代表的含义，我们说xpath是非常简洁非常美丽的一种表达HTML元素的方式一点儿也不为过。 当然，还有一些其他的句法可以和 child:: 一样可以省略，比如，你可以使用@foo 代替 attribute::foo， /descendant-or-self::foo 可以写成 //foo。

句法规则及示例
-------

> 介绍xpath的详细规则以及示例

1.  条件 \[\]

    # 选择元素 AAA 的 第一个 BBB 子元素
    /AAA/BBB[1]
    
    # 选择元素 AAA 的最后一个 BBB 子元素
    /AAA/BBB[last()]
    

2.  属性

    # 选择所有的属性 @id
    //@id
    
    # 选择所有拥有 name 属性的 BBB 元素
    //BBB[@name]
    
    # 选择有任意属性的 BBB 元素
    //BBB[@*]
    
    # 选择没有任何一个属性的BBB元素
    //BBB[not(@*)]
    

3.  属性值

    # 选择有属性 id=b1 的BBB元素
    //BBB[@id='b1']
    

4.  节点数量

    # 选择有两个子节点BBB 的元素
    //*[count(BBB)=2]
    
    # 选择有两个子元素的元素
    //*[count(*)=2]
    

5.  name等函数的使用

> name()函数：返回元素的名称。 starts-with函数：如果第一个参数的string值以第二个参数string值开始，返回true。 contains函数：如果第一个参数的string值包含第二个参数的string值，返回true。

例如：

    # 等价于 //BBB
    //*[name()='BBB']
    
    # 选择所有以字母B开头的元素
    //*[starts-with(name(), 'B')]
    
    # 选择所有名称包含字母C的元素
    //*[contains(name(), 'C')]
    

6.  string-length函数

> string-length方法：返回string的字符个数 你应该使用 < 代替 < ，使用 > 代替 >

    # 选择名字小于三个字符的元素
    //*[string-length(name()) < 3]
    

7.  使用 | 组合XPaths

    # 选择所有的CCC元素和BBB元素
    //CCC | //BBB
    

8.  使用 axis

    # Child axis，以下等价于/AAA
    /child::AAA
    
    # Descendant axis
    # 选择 /AAA/BBB 的所有的子孙元素
    /AAA/BBB/descendant::*
    
    # 选择有CCC祖先的所有的DDD元素
    //CCC/descendant::DDD
    
    # Parent axis
    # 选择所有的DDD元素的父元素
    //DDD/parent::*
    
    # Ancestor axis
    # 选择给定绝对路径元素的所有的祖先元素
    /AAA/BBB/DDD/CCC/ancestor::*
    

参考及更多用法
-------

[XPath 1.0 Tutorial](http://zvon.org/comp/r/tut-XPath_1.html#Pages~Parent_axis)