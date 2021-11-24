import {ComplexAttributeConverter} from '@lit/reactive-element';

export function elementSelector(): ComplexAttributeConverter<HTMLElement | null, HTMLElement> {
  return {
    fromAttribute: (value, _type) => {
      console.debug('fromAttribute');
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
