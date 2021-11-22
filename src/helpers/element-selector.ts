import {ComplexAttributeConverter} from '@lit/reactive-element';

export function elementSelector(): ComplexAttributeConverter<
  HTMLElement | null,
  HTMLElement
> {
  return {
    fromAttribute: (value, _type) => {
      // TODO Use type of _type to determine how to handle query (throw error if wrong type?)
      if (!value) {
        return null;
      }
      return document.querySelector<HTMLElement>(`#${value}`);
    },
    toAttribute: (value) => {
      if (!(value instanceof HTMLElement)) {
        return null;
      }
      return value.id;
    },
  };
}
