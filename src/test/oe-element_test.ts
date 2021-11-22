/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {OeElement} from '../oe-element.js';

import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';

describe('oe-element', () => {
  it('is defined', () => {
    const el = document.createElement('oe-element');
    assert.instanceOf(el, OeElement);
  });

  it('renders with default values', async () => {
    const el = await fixture(html`<oe-element></oe-element>`);
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, World!</h1>
      <button part="button">Click Count: 0</button>
      <slot></slot>
    `
    );
  });

  it('renders with a set name', async () => {
    const el = await fixture(html`<oe-element name="Test"></oe-element>`);
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, Test!</h1>
      <button part="button">Click Count: 0</button>
      <slot></slot>
    `
    );
  });

  it('handles a click', async () => {
    const el = (await fixture(html`<oe-element></oe-element>`)) as OeElement;
    const button = el.shadowRoot!.querySelector('button')!;
    button.click();
    await el.updateComplete;
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, World!</h1>
      <button part="button">Click Count: 1</button>
      <slot></slot>
    `
    );
  });

  it('styling applied', async () => {
    const el = (await fixture(html`<oe-element></oe-element>`)) as OeElement;
    await el.updateComplete;
    assert.equal(getComputedStyle(el).paddingTop, '16px');
  });
});
