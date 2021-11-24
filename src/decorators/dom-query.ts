import {ReactiveController} from '@lit/reactive-element';
import {LitElement} from 'lit';

export class DomQueryController<T extends LitElement> implements ReactiveController {
  public host: T;
  private elExistsObserver: MutationObserver;
  private elNotExistsObserver: MutationObserver;

  public constructor(host: T, public property: keyof T) {
    (this.host = host).addController(this);
    this.elExistsObserver = new MutationObserver(() => this.triggerUpdate());
    this.elNotExistsObserver = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.addedNodes.length > 0)) {
        this.triggerUpdate();
      }
    });
  }

  public hostConnected(): void {
    this.updateObservers();
  }

  public hostDisconnected(): void {
    this.elExistsObserver?.disconnect();
    this.elNotExistsObserver?.disconnect();
  }

  public hostUpdated(): void {}

  private triggerUpdate() {
    this.host.attributeChangedCallback(this.property as string, null, this.host.getAttribute(this.property as string));
    this.updateObservers();
  }

  private updateObservers(): void {
    if (this.host[this.property]) {
      const parent = (this.host[this.property] as unknown as HTMLElement).parentNode as Node;
      this.elExistsObserver.observe(parent, {childList: true, subtree: false});
      this.elNotExistsObserver.disconnect();
    } else {
      this.elNotExistsObserver.observe(document, {childList: true, subtree: true});
      this.elExistsObserver.disconnect();
    }
  }
}
