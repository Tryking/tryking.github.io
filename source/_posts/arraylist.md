---
title: ArrayList-Part1
url: 145.html
id: 145
category:
- Java
date: 2018-06-13 09:35:49
tags:
---

### 构造方法

ArrayList共有三个构造方法

<!--more-->

1.  无参构造方法

    public ArrayList() {
         this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
    }
    
    transient Object[] elementData;
    private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};
    

无参构造方法会创建一个Object数组，其实这里并没有指定数组的大小。但是不知道为什么JDK文档中说是指定一个Capacity为10的list。

2.  指定初始Capacity的构造方法

    public ArrayList(int initialCapacity) {
        if (initialCapacity > 0) {
            this.elementData = new Object[initialCapacity];
        } else if (initialCapacity == 0) {
            this.elementData = EMPTY_ELEMENTDATA;
        } else {
            throw new IllegalArgumentException("Illegal Capacity: " + initialCapacity);
        }
    }
    

此构造方法会创建一个Capacity为指定数值的ArrayList。

3.  以一个集合创建ArrayList的构造方法

    public ArrayList(Collection<? extends E> c) {
        elementData = c.toArray();
        if ((size = elementData.length) != 0) {
            // defend against c.toArray (incorrectly) not returning Object[]
            // (see e.g. https://bugs.openjdk.java.net/browse/JDK-6260652)
            if (elementData.getClass() != Object[].class)
                elementData = Arrays.copyOf(elementData, size, Object[].class);
        } else {
            // replace with empty array.
            this.elementData = EMPTY_ELEMENTDATA;
        }
    }
    

此构造方法会将传进来的集合c的数据复制给本身的数据数组。然后对数据数组的长度做了判断，如果长度不等于0的话将其类的类型做了判断，文档中说是这里为了修复一个bug，暂不做深究。当长度等于0时，将数据数组置为了空数组 EMPTY_ELEMENTDATA 。

### 元素变更add

1.  一个参数

    public boolean add(E e) {
        modCount++;
        add(e, elementData, size);
        return true;
    }
    

这就是我们平时使用最多的方法add，此方法先将modCount参数做了++处理，然后调用了私有方法add，私有方法如下：

    private void add(E e, Object[] elementData, int s) {
        if (s == elementData.length)
            elementData = grow();
        elementData[s] = e;
        size = s + 1;
    }
    

此方法对 this.elementData 的长度和 this.size 做了判断，即如果已存在的list大小和数组长度相同的话，要想继续添加元素，则需要对数组进行扩容（grow()方法）。然后将数组的s位置置为e，并将list的size加了1。

2.  两个参数（指定位置）

    public void add(int index, E element) {
        rangeCheckForAdd(index);
        modCount++;
        final int s;
        Object[] elementData;
        if ((s = size) == (elementData = this.elementData).length)
            elementData = grow();
        System.arraycopy(elementData, index,
                         elementData, index + 1,
                         s - index);
        elementData[index] = element;
        size = s + 1;
    }
    

此方法首先对index的值做了判定，不符合时直接抛出异常。然后modCount做了++操作。接着又对list的大小和数组的长度做了判断，当两者相等时，对list进行扩容（grow()）。最关键的赋值一步使用了jdk的native方法System.arraycopy()，留下了index位置并将其置为传进来的值，最后再对size的值进行+1操作。

3.  添加一个集合

    public boolean addAll(Collection<? extends E> c) {
        Object[] a = c.toArray();
        modCount++;
        int numNew = a.length;
        if (numNew == 0)
            return false;
        Object[] elementData;
        final int s;
        if (numNew > (elementData = this.elementData).length - (s = size))
            elementData = grow(s + numNew);
        System.arraycopy(a, 0, elementData, s, numNew);
        size = s + numNew;
        return true;
    }
    

此方法首先将集合c的元素取出来作为了一个数组a，这里使用了toArray方法，最终其实使用的是native方法 System.arraycopy 方法。如果数组a的大小为0，直接返回false。如果现有的Capacity不能容纳新添加的集合元素，则对其进行扩容（grow()，这里增加了一个参数最小capacity）。接着使用System.arraycopy对数组进行拷贝赋值，并置size为新值。

4.  在指定位置添加一个集合

    public boolean addAll(int index, Collection<? extends E> c) {
        rangeCheckForAdd(index);
    
        Object[] a = c.toArray();
        modCount++;
        int numNew = a.length;
        if (numNew == 0)
            return false;
        Object[] elementData;
        final int s;
        if (numNew > (elementData = this.elementData).length - (s = size))
            elementData = grow(s + numNew);
    
        int numMoved = s - index;
        if (numMoved > 0)
            System.arraycopy(elementData, index,
                             elementData, index + numNew,
                             numMoved);
        System.arraycopy(a, 0, elementData, index, numNew);
        size = s + numNew;
        return true;
    }
    

首先还是判断了index的合法性。然后将集合的元素放到数组a中，如果数组a的大小为0，直接返回false。如果capacity剩余容量不足以容纳a，则进行扩容处理。判断添加的位置：如果添加的位置不在原有的size位，则需要将原有数组的index位置以后的值放置到后面几位，空出新添加的值的位置。再讲新添加的值填充到对应的位置上。最后将size的值置为新值。

### 元素变更remove

1.  移除元素

    public boolean remove(Object o) {
        final Object[] es = elementData;
        final int size = this.size;
        int i = 0;
        found: {
            if (o == null) {
                for (; i < size; i++)
                    if (es[i] == null)
                        break found;
            } else {
                for (; i < size; i++)
                    if (o.equals(es[i]))
                        break found;
            }
            return false;
        }
        fastRemove(es, i);
        return true;
    }
    

此方法首先对元素o的值进行了判断，然后在数组中找是否有此值，因为用了双层的嵌套，所以这里使用了outer方法来跳出循环。如果没有找到此元素，直接返回false，如果找到了此元素，利用找到的位置进行fastRemove操作。

    private void fastRemove(Object[] es, int i) {
        modCount++;
        final int newSize;
        if ((newSize = size - 1) > i)
            System.arraycopy(es, i + 1, es, i, newSize - i);
        es[size = newSize] = null;
    }
    

在fastRemove中，先对modCount做了++操作，接着判断要移除的位置是否在前size-1位上，如果在，则使用native方法进行System.arraycopy，不在则忽略。最后对size重新赋值为size-1，并将数组的size位置为null。

2.  移除指定位置的元素

    public E remove(int index) {
        Objects.checkIndex(index, size);
        final Object[] es = elementData;
    
        @SuppressWarnings("unchecked") E oldValue = (E) es[index];
        fastRemove(es, index);
    
        return oldValue;
    }
    

此方法首先检查了index为合法的值（这里调用了Objects的方法，里面的实现很简单，就是对index和0与size的大小做了判断，应该是要统一判断抛出异常的）。然后和上面的方法一样，使用fastRemove方法进行了移除操作。