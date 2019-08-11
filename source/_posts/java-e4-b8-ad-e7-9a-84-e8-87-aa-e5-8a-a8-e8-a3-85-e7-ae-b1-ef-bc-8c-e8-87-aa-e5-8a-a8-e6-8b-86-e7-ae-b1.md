---
title: Java中的自动装箱，自动拆箱
url: 143.html
id: 143
category:
- Java
date: 2018-06-06 00:31:47
tags:
---

包装类的由来
======

虽然我们常说在Java中我们不缺对象，任何时刻都可以 new 一个对象，一切皆为对象。但是在Java中还存在一些原始数据类型，比如 int，long，float，double，byte，short，boolean，char。这些原始数据类型并不是对象。 在Java中，引入了对于8中基本数据类型的包装类，比如对于 int 的包装类 Integer 。在Integer中，有一个int字段用于存储数据值，并且还提供了一些基本数据类型int做不到的事情，比如和字符串的转换等。

<!--more-->

装箱拆箱
====

当我们想要创建一个 Integer 对象时，传统的做法是

    Integer x = Integer.valueOf("3");
    

但是有了自动装箱后，我们只需要用

    Integer x = 3;
    

当编译时，Javac会自动帮我们装箱，把 `Integer x = 3;` 转换为 `Integer x = Integer.valueOf("3");` ，这极大的方便了我们代码的书写。 相应地，拆箱的操作会将 `int y = x` 转换为 `int y = x.intValue();`