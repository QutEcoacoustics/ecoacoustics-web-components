---
layout: page.11ty.cjs
title: <oe-element> ⌲ Home
---

# &lt;oe-element>

`<oe-element>` is an awesome element. It's a great introduction to building web components with LitElement, with nice documentation site as well.

## As easy as HTML

<section class="columns">
  <div>

`<oe-element>` is just an HTML element. You can it anywhere you can use HTML!

```html
<oe-element></oe-element>
```

  </div>
  <div>

<oe-element></oe-element>

  </div>
</section>

## Configure with attributes

<section class="columns">
  <div>

`<oe-element>` can be configured with attributed in plain HTML.

```html
<oe-element name="HTML"></oe-element>
```

  </div>
  <div>

<oe-element name="HTML"></oe-element>

  </div>
</section>

## Declarative rendering

<section class="columns">
  <div>

`<oe-element>` can be used with declarative rendering libraries like Angular, React, Vue, and lit-html

```js
import {html, render} from 'lit-html';

const name = 'lit-html';

render(
  html`
    <h2>This is a &lt;oe-element&gt;</h2>
    <oe-element .name=${name}></oe-element>
  `,
  document.body
);
```

  </div>
  <div>

<h2>This is a &lt;oe-element&gt;</h2>
<oe-element name="lit-html"></oe-element>

  </div>
</section>
