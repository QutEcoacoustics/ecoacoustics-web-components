import {PropertyDeclaration, ReactiveController, ReactiveElement} from '@lit/reactive-element';
import {LitElement} from 'lit';
import {elementSelector, ElementSelector, QueryResult} from '../helpers/element-selector';

/**
 * Observes any changes to the query element, and if a change occurs, will
 * trigger an update in the element with the new DOM value
 */
class DomQueryController<T extends LitElement> implements ReactiveController {
  private observer: MutationObserver;

  public constructor(public host: T, public property: keyof T & string) {
    host.addController(this);
    this.observer = new MutationObserver(this.observed.bind(this));
  }

  public hostConnected(): void {
    this.observer.observe(document, {childList: true, subtree: true});
    this.checkValue();
  }

  public hostDisconnected(): void {
    this.observer?.disconnect();
  }

  private observed(_mutations: MutationRecord[], _observer: MutationObserver): void {
    this.checkValue();
  }

  private checkValue(): void {
    const newValue = ElementSelector.query(this.getAttributeValue());
    const oldValue = this.getPropertyValue();
    if (newValue !== oldValue) {
      this.setPropertyValue(newValue);
    }
  }

  /**
   * Returns the attribute value of the property on the lit element
   * @returns Attribute value of property on lit element
   */
  private getAttributeValue(): string | null {
    // warning: this attribute name may not equal the property name
    // see: https://github.com/lit/lit/blob/890c59212f177039141fc7689b73b64f0317f86d/packages/reactive-element/src/reactive-element.ts#L691-L703
    return this.host.getAttribute(this.property);
  }

  /**
   * Not to be confused with the attribute value of the property on the
   * lit element. This instead grabs the value set after conversion in the
   * property decorator.
   * @returns Property value of the lit element
   */
  private getPropertyValue(): QueryResult {
    return this.host[this.property] as any as QueryResult;
  }

  /**
   * Set the property value and trigger an update cycle in the lit element.
   * This is not changing the lit elements attribute, and thus will not trigger
   * `attributeChangedCallback`. Instead hook into `willUpdate` to monitor for
   * changes.
   */
  private setPropertyValue(value: QueryResult): void {
    // setting the accessor will trigger a lit update cycle
    this.host[this.property] = value as any;
  }
}

/**
 * Registers a @`property for DOM mutation observation updates. i.e. if your
 * your property depends on a DOM element outside the component, other actors
 * can delete or add elements without lit knowing. This decorator watches for
 * DOM updates and triggers the lit update cycle.
 * Note that you should set @attr somewhere in the xml comment for the property
 *
 * @category Decorator
 *
 * @example
 * ```ts
 *
 * @domQuery<MyComponent>({type: String, converter: elementSelector()})
 * myAttribute!: HtmlElement | null;
 * ```
 *
 * @returns A decorator function that applies the described affects.
 */
export function domQuery<T extends LitElement>(options?: PropertyDeclaration) {
  return (target: T, property: keyof T & string): void => {
    // add a converter in
    const ctor = target.constructor as typeof LitElement;

    // make this a property of the lit element
    const defaultOptions = {type: String, converter: elementSelector(), ...options};
    ctor.createProperty(property, defaultOptions);

    if (!(defaultOptions?.converter instanceof ElementSelector)) {
      throw new Error(`@domQuery can only be used on properties that have a converter of type ElementSelector`);
    }

    // add a controller to hook into lifecycle events
    // we use the static .addInitializer here to avoid binding to the wrong instance.
    // The instance of `target`, right here in this decorator, is not the instance that will be used in the DOM.
    ctor.addInitializer((instance: ReactiveElement): void => {
      new DomQueryController(instance as T, property);
    });
  };
}
