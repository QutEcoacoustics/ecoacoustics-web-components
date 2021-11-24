import {ReactiveController, ReactiveElement} from '@lit/reactive-element';
import {LitElement} from 'lit';
import {ElementSelector, QueryResult} from '../helpers/element-selector';
class DomQueryController<T extends LitElement> implements ReactiveController {
  private observer: MutationObserver;

  public constructor(public host: T, public property: keyof T) {
    host.addController(this);

    this.observer = new MutationObserver(this.observed.bind(this));
  }

  public hostConnected(): void {
    this.observer.observe(document, {childList: true, subtree: true});
  }

  public hostDisconnected(): void {
    this.observer?.disconnect();
  }

  private observed(_mutations: MutationRecord[], _observer: MutationObserver) {
    this.checkValue();
  }
  private checkValue() {
    const newValue = ElementSelector.query(this.getAttributeValue());
    const oldValue = this.getPropertyValue();
    if (newValue !== oldValue) {
      this.setPropertyValue(newValue);
    }
  }

  private getAttributeValue() {
    // warning: this attribute name may not equal the property name
    // see: https://github.com/lit/lit/blob/890c59212f177039141fc7689b73b64f0317f86d/packages/reactive-element/src/reactive-element.ts#L691-L703
    return this.host.getAttribute(this.property as string);
  }

  private getPropertyValue(): QueryResult {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.host[this.property] as any as QueryResult;
  }

  private setPropertyValue(value: QueryResult) {
    // setting the accessor will trigger a lit update cycle
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.host[this.property] = value as any;
  }
}

/**
 * Registers a @`property for DOM mutation observation updates. i.e. if your
 * your property depends on a DOM element outside the component, other actors
 * can delete or add elements without lit knowing. This decorator watches for
 * DOM updates and triggers the lit update cycle.
 * @example
 * ```ts
 * @domQuery<MyComponent>()
 * @property({type: String, converter: elementSelector() })
 * myAttribute: HtmlElement | null;
 * ```
 * @returns A decorator function that applies the described affects.
 */
export function domQuery<T extends LitElement>() {
  return (target: T, property: keyof T) => {
    // add a converter in
    const ctor = target.constructor as typeof LitElement;

    // we could create the @property decorator here, but it will mess with
    // the docs and type system that depend on @property
    // get the property definition
    //ctor.createProperty(property, { ... })

    // or get existing lit property definition
    const options = ctor.elementProperties.get(property);

    if (!(options?.converter instanceof ElementSelector)) {
      throw new Error(`@domQuery can only be used on properties that have a converter of type ElementSelector`);
    }

    // add a controller to hook into lifecycle events
    // we use the static .addInitializer here to avoid binding to the wrong instance here.
    // The instance of `target`, right here in this function, is not the instance that will be used in the DOM.
    ctor.addInitializer((instance: ReactiveElement) => {
      new DomQueryController(instance as T, property);
    });
  };
}
