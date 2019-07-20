---
title: Bootstrap - Modal 插件
toc: true
date: 2019-07-19 21:56:01
tags:
category:
thumbnail:
---
有时候我们可能需要在页面弹出一个对话框，或者传统的叫做 Popup Window 的东西。其实 Bootstrap 给我们提供了一个插件，可以非常方便的构造这几种东西，这个插件叫做 `Modal`。

<!--more-->

## 引入 js 文件

Bootstrap 的插件有很多都是独立成型的，并不需要依赖 Bootstrap 的所有 js 文件。想要使用 `Modal` 插件，我们既可以只引用单独的 `modal.js` 文件，还可以引包含 Bootstrap 的大部分内容的 js 文件 `bootstrap.js` 或 `bootstrap.min.js`。比如这里，我们直接引用 CDN，使用 `bootstrap.min.js` 文件。

```HTML
<head>
  <title>Bootstrap Example</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
</head>
```

## 创建一个 Modal

下面我们创建一个 Modal，点击页面按钮直接跳出一个 Modal:

```HTML
<!-- Trigger the modal with a button -->
<button type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="#myModal">Open Modal</button>

<!-- Modal -->
<div id="myModal" class="modal fade" role="dialog">
  <div class="modal-dialog">

    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title">Modal Header</h4>
      </div>
      <div class="modal-body">
        <p>Some text in the modal.</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
      </div>
    </div>

  </div>
</div>
```

> 你可以在 W3C 提供的 [工具](https://www.w3schools.com/bootstrap/tryit.asp?filename=trybs_modal&stacked=h) 上进行尝试。

### Trigger 部分

在 Trigger 部分，我们使用了一个 “Open Modal” 的按钮来触发一个 Modal，在此按钮中需要加入两个 `data-*` 属性：

* `data-toggle="modal"` 表明我们需要让其打开一个 modal。
* `data-target="#myModal"` 指向我们定义 modal 的 id。

### Modal 部分

* 在 Modal 部分，在最外层的 `<div>` 部分，我们必须定义一个和在 Trigger 部分一样的 id，以让按钮能定位到此 Modal。
* `.modal` 类将 `<div>` 的内容标识为 modal。
* `.fade` 类会增加一个 modal 弹出及消失的渐变效果，如果不需要可以将此类去掉。
* `role="dialog"` 属性可以方便使用屏幕阅读器的人进行访问。
* `.modal-dialog` 类设置了此 modal 适当的宽度和页面边的 margin。

### Modal content 部分

* 拥有`class="modal-content"` 的 `<div>` 定义了 modal 的样式（比如 border, background-color 等）。在此 `<div>` 中可以添加 modal 的 header, body 以及 footer 内容。
* `.modal-header` 类用于定义 modal 的 header 的样式。header 中有一个属性为 `data-dismiss="modal"` 的 `<button>`，点击它可以将 modal 关闭。`.close` 类定义了关闭按钮的样式。`.modal-title` 类以一个合适的行高定义了 header 的样式。
* `.modal-body` 类用于定义 modal body 的样式。在这里面可以添加任何的 HTML 标记来生成 modal 的主体内容，比如你可以使用 paragraphs, images, videos 等。
* `.modal-footer` 类用于定义 modal footer 的样式。默认情况下，此区域会右对齐。

## 更改 modal 大小

在拥有 `.modal-dialog` 类的 `<div>` 中增加某些类可以控制 modal 的大小。

* `.modal-sm`：small modal

> ```
> <div class="modal-dialog modal-sm">
> ```

* `.modal-lg`：large modal

> ```
> <div class="modal-dialog modal-lg">
> ```

*默认情况下，modal 采用中等（medium）大小*

> 更多用法，可参考 [W3C教程：Bootstrap JS Modal](https://www.w3schools.com/bootstrap/bootstrap_ref_js_modal.asp)。

---
> **标题**：[title](https://dengkaiting.com/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[link](https://dengkaiting.com/)
> **时间**：2019-07-11
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。