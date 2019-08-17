---
title: Elasticsearch 查询语法(Kibana)）
toc: true
date: 2019-08-17 19:09:17
tags:
category:
thumbnail:
---
当我们使用 `ELK` 来分析日志时，需要根据条件过滤日志。其实在 `Kibana` 中用的查询语言就是 Elasticsearch 的查询语言，即使用 Lucene 的查询语法。

<!--more-->

* status 字段 包含 avtive

	```
	status:active
	```
* title 字段包含 quick 或 brown

	```
	title:(quick OR brown)
	```
* author 字段包含确切短语 “john smith”

	```
	author:"John Smith"
	```
* book.title, book.content 或 book.date 中的任何字段包含 quick 或 brown （注意我们需要使用反斜杠转义*）
	
	```
	book.\*:(quick OR brown)
	```
* 字段 title 具有任何非空值

	```
	_exists_:title
	```
	



---
> **标题**：[{{title}}](https://dengkaiting.com/2019/00/00/{{ title }}/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[link](https://dengkaiting.com/)
> **时间**：{{ date }}
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。