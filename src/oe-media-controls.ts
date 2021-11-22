import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {elementSelector} from './helpers/element-selector';

/**
 * A media control element
 *
 * TODO Full description here
 */
@customElement('oe-media-controls')
export class OeMediaControls extends LitElement {
  static override styles = [
    css`
      :host {
        display: block;
        background-color: var(--oe-background-colour, unset);
      }
    `,
  ];

  @property({
    type: HTMLAudioElement,
    converter: elementSelector(),
  })
  for?: HTMLAudioElement = undefined;

  override render() {
    return html` <div>${this.playPauseButton()}</div> `;
  }

  @state()
  private state: 'Play' | 'Pause' = 'Play';

  private playPauseButton() {
    return html`
      <button part="play-pause-button" @click="${this.clickHandler}">
        ${this.isPlaying()
          ? html`<slot name="play-label">Play</slot>`
          : html`<slot name="pause-label">Pause</slot>`}
      </button>
    `;
  }

  private clickHandler(): void {
    if (this.isPlaying()) {
      this.for?.play();
    } else {
      this.for?.pause();
    }

    this.state = this.isPlaying() ? 'Pause' : 'Play';
  }

  private isPlaying() {
    return this.state === 'Play';
  }
}
