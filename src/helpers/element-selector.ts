import {ComplexAttributeConverter} from '@lit/reactive-element';

export type QueryResult = HTMLElement | null;

export class ElementSelector implements ComplexAttributeConverter<HTMLElement | null, HTMLElement> {
  public static query(selector: string | null): QueryResult {
    if (!selector) {
      return null;
    }

    return document.getElementById(selector);
  }

  public fromAttribute(value: string | null, _type?: HTMLElement): QueryResult {
    return ElementSelector.query(value);
  }
}

export function elementSelector(): ElementSelector {
  return new ElementSelector();
}
