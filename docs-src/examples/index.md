---
layout: example.11ty.cjs
title: <oe-element> ⌲ Examples ⌲ Basic
tags: example
name: Basic
description: A basic example
---

<style>
  oe-element p {
    border: solid 1px blue;
    padding: 8px;
  }
</style>
<oe-element>
  <p>This is child content</p>
</oe-element>

<h3>CSS</h3>

```css
p {
  border: solid 1px blue;
  padding: 8px;
}
```

<h3>HTML</h3>

```html
<oe-element>
  <p>This is child content</p>
</oe-element>
```
