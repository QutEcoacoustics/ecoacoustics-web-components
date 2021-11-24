import {elementUpdated} from '@open-wc/testing';
import {fixtureWrapper} from '@open-wc/testing-helpers';
import {LitHTMLRenderable} from '@open-wc/testing-helpers/types/src/litFixture';
import {LitElement, render} from 'lit';

function isLitElement(element: Element): element is LitElement {
  return element instanceof LitElement;
}

/**
 * Similar to fixture, renders multiple elements in a wrapper, waits for
 * all LitElements to be rendered, and returns the targeted element.
 * After the test the wrapper and child nodes are automatically removed.
 * Adapted from: https://github.com/open-wc/open-wc/blob/9d275bd3a489d29325ca9f1ea5f887ffb4c1cb08/packages/testing-helpers/src/litFixture.js#L62
 * @param template - The template to render.
 * @param selector - A query selector for the targeted element
 * @returns - A promise that resolves to the rendered element.
 */
export async function fixtureWithContext<T extends LitElement>(
  template: LitHTMLRenderable,
  selector?: string
): Promise<T> {
  // create the container
  const parentNode = fixtureWrapper() as HTMLElement;

  // render the context html
  render(template, parentNode);

  // now scan through dom and wait for each LitElement to finish rendering
  const nodes = Array.from(parentNode.querySelectorAll('*')).filter(isLitElement);

  if (nodes.length > 1 && !selector) {
    throw new Error('fixtureWithContext() requires a selector when multiple LitElements are rendered');
  }

  await Promise.all(nodes.map(elementUpdated));

  const target = selector ? parentNode.querySelector(selector) : nodes[0];

  if (!target) {
    throw new Error(`Could not find element with selector: ${selector}`);
  }

  if (!(target instanceof LitElement)) {
    throw new Error('Element found is not an instance of LitElement');
  }

  return target as T;
}
