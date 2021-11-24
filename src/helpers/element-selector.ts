import {ComplexAttributeConverter} from '@lit/reactive-element';

export type QueryResult = HTMLElement | null;

export class ElementSelector implements ComplexAttributeConverter<HTMLElement | null, HTMLElement> {
  public static query(selector: string | null) : QueryResult {
    if (!selector) {
      return null;
    }

    return document.querySelector<HTMLElement>(selector);
  }

  public fromAttribute(value: string | null, _type? : HTMLElement) : QueryResult {
    console.debug('fromAttribute');
   return ElementSelector.query(value);
  }

  public toAttribute(value: QueryResult) : String | null {
    if (!(value instanceof HTMLElement)) {
      return null;
    }
    return value.id;
  }
}

export function elementSelector(): ElementSelector{
  return new ElementSelector();
}
