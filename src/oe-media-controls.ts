import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {domQuery} from './decorators/dom-query';
//import {AudioWrapper} from './helpers/audio-wrapper';
import {elementSelector} from './helpers/element-selector';
import {WithLogging} from './mixins/LoggingElement';

export enum AudioState {
  Seeking,
  Playing,
  Paused,
  Loading,
  Error,
}

/**
 * A media control element
 *
 * TODO Full description here
 */
@customElement('oe-media-controls')
export class OeMediaControls extends WithLogging(LitElement) {
  static override styles = [
    css`
      :host {
        display: block;
        background-color: var(--oe-background-colour, unset);
      }
    `,
  ];

  /**
   * ID selector which determines which audio player this element should
   * control
   */
  @domQuery<OeMediaControls>()
  @property({
    type: String,
    converter: elementSelector(),

  })
  for?: HTMLAudioElement = undefined;

  // Store for id in

  /** Tracks the current state of the audio player */
  @state()
  public state = AudioState.Loading;

  /** Tracks any error messages which need to be displayed */
  @state()
  public error: string | null = '';

  //private audioWrapper!: AudioWrapper;

  public constructor() {
    super();
  }

  public override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, old, value);

    console.log(this.for, this.for?.isConnected);

    // if (!this.for) {
    //   this.state = AudioState.Error;
    //   this.error = 'oe-media-controls is not linked to an audio element';
    //   this.logger.error('oe-media-controls is not linked to an audio element');
    //   return;
    // }
    // this.state = AudioState.Loading;
    // this.error = null;

    // if (!this.audioWrapper) {
    //   this.audioWrapper = new AudioWrapper(this.for);
    // }

    // this.audioWrapper.eventUpdates().subscribe((event) => {
    //   if (event.error) {
    //     this.state = AudioState.Error;
    //     this.error = event.error;
    //   } else if (!event.canPlay) {
    //     this.state = AudioState.Loading;
    //   } else if (event.paused || event.ended) {
    //     this.state = AudioState.Paused;
    //   } else if (event.playing) {
    //     this.state = AudioState.Playing;
    //   }
    // });
  }

  public override disconnectedCallback(): void {
    // this.audioWrapper?.destroy();
  }

  public override render() {
    console.log(this.for);

    return html`<div>${this.error ? this.errorMessage() : this.playPauseButton()}</div>`;
  }

  /** Tell the audio player to pause */
  public pause(): void {
    this.for?.pause();
  }

  /** Tell the audio player to play */
  public play(): void {
    this.for?.play();
  }

  /** Sub element for displaying play/pause button */
  private playPauseButton() {
    const label = this.isPlaying()
      ? html`<slot name="pause-label">Pause</slot>`
      : html`<slot name="play-label">Play</slot>`;
    return html`
      <button part="play-pause-button" ?disabled="${this.isDisabled()}" @click="${this.clickHandler}">${label}</button>
    `;
  }

  /** Sub element for displaying error messages */
  private errorMessage() {
    return html`<span class="error" title="${this.error}">${this.error}</span>`;
  }

  /** Handle the click event of the play/pause button */
  private clickHandler(): void {
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.play();
    }

    this.state = this.isPlaying() ? AudioState.Paused : AudioState.Playing;
  }

  /**
   * Determine if the state of the audio player means that the play/pause
   * button should be disabled
   */
  private isDisabled(): boolean {
    return [AudioState.Seeking, AudioState.Loading].includes(this.state);
  }

  /** Determine if the state of the audio player is currently playing */
  private isPlaying(): boolean {
    return this.state === AudioState.Playing;
  }
}
