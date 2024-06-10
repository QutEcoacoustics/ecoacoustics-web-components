import { LitElement, PropertyValues, TemplateResult, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { mediaControlsStyles } from "./css/style";
import { ILogger, rootContext } from "../logger/logger";
import { provide } from "@lit/context";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { AbstractComponent } from "../../mixins/abstractComponent";
import { Spectrogram } from "spectrogram/spectrogram";
import lucidPlayIcon from "lucide-static/icons/play.svg?raw";
import lucidPauseIcon from "lucide-static/icons/pause.svg?raw";
import lucidePalette from "lucide-static/icons/palette.svg?raw";
import lucideAudioWaveform from "lucide-static/icons/audio-waveform.svg?raw";
import lucideProportions from "lucide-static/icons/proportions.svg?raw";
import lucideBlend from "lucide-static/icons/blend.svg?raw";
import lucideRuler from "lucide-static/icons/ruler.svg?raw";
import lucideSun from "lucide-static/icons/sun.svg?raw";
import lucideContrast from "lucide-static/icons/contrast.svg?raw";

/**
 * A simple media player with play/pause and seek functionality that can be used with the open ecoacoustics spectrograms and components.
 *
 * @property for - The id of the audio element to control
 *
 * @csspart play-icon - Styling applied to the play icon (including default)
 * @csspart pause-icon - Styling applied to the pause icon (including default)
 *
 * @slot play-icon - The icon to display when the media is stopped
 * @slot pause-icon - The icon to display when the media is playing
 */
@customElement("oe-media-controls")
export class MediaControls extends AbstractComponent(LitElement) {
  public static styles = mediaControlsStyles;

  @provide({ context: rootContext })
  public logger: ILogger = {
    log: console.log,
  };

  @property({ type: String })
  public for = "";

  @query("#spectrogram-settings")
  private spectrogramSettingsForm!: HTMLFormElement;

  @state()
  private currentSettingsTemplate: TemplateResult<1> | null = null;

  private spectrogramElement?: Spectrogram | null;
  private playHandler = this.handleUpdatePlaying.bind(this);

  public disconnectedCallback(): void {
    this.spectrogramElement?.removeEventListener("play", this.playHandler);
    super.disconnectedCallback();
  }

  public toggleAudio(): void {
    // if the media controls element is not bound to a spectrogram element, do nothing
    if (!this.spectrogramElement) return;

    if (this.isSpectrogramPlaying()) {
      this.spectrogramElement.pause();
    } else {
      this.spectrogramElement.play();
    }
  }

  protected willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("for")) {
      if (!this.for) return;

      // unbind the previous spectrogram element from the playing
      this.spectrogramElement?.removeEventListener("play", this.playHandler);

      this.spectrogramElement = this.parentElement?.querySelector<Spectrogram>(`#${this.for}`);
      this.spectrogramElement?.addEventListener("play", this.playHandler);
    }
  }

  private handleUpdatePlaying(): void {
    this.logger.log(`Audio ${this.isSpectrogramPlaying() ? "playing" : "paused"} `);
    this.requestUpdate();
  }

  private isSpectrogramPlaying(): boolean {
    if (!this.spectrogramElement) {
      return false;
    }

    return !this.spectrogramElement?.paused;
  }

  // TODO: tighten this typing. It should be a form submit event
  // TODO: clean up this function, it is terrible
  private updateSpectrogramOptions(): void {
    if (!this.spectrogramElement) {
      console.log("returning");
      return;
    }

    const formData = new FormData(this.spectrogramSettingsForm);
    const formObject = Object.fromEntries(formData);

    for (const [key, value] of Object.entries(formObject)) {
      if (key === "brightness" || key === "contrast" || key === "windowSize" || key === "windowOverlap") {
        (this.spectrogramElement[key] as any) = Number(value);
      } else if (key === "melScale") {
        (this.spectrogramElement[key] as any) = value === "true";
      } else {
        ((this.spectrogramElement as any)[key as any] as any) = value;
      }
    }
  }

  private playIcon() {
    return html`<slot name="play-icon" part="play-icon">${unsafeSVG(lucidPlayIcon)}</slot>`;
  }

  private pauseIcon() {
    return html`<slot name="pause-icon" part="pause-icon">${unsafeSVG(lucidPauseIcon)}</slot>`;
  }

  private spectrogramSettingsTemplate(): TemplateResult<1> {
    return html`
      <form id="spectrogram-settings" @change="${this.updateSpectrogramOptions}">
        <div class="settings-menu">
          <sl-dropdown>
            <sl-button slot="trigger" caret>${unsafeSVG(lucidePalette)} Colour</sl-button>
            <sl-menu>
              <sl-menu-item value="grayscale">Grayscale</sl-menu-item>
              <sl-menu-item value="audacity" selected>Audacity</sl-menu-item>
              <sl-menu-item value="raven">Raven</sl-menu-item>
              <sl-menu-item value="cubeHelix">Cube Helix</sl-menu-item>
              <sl-menu-item value="viridis">Viridis</sl-menu-item>
              <sl-menu-item value="turbo">Turbo</sl-menu-item>
              <sl-menu-item value="plasma">Plasma</sl-menu-item>
              <sl-menu-item value="inferno">Inferno</sl-menu-item>
              <sl-menu-item value="magma">Magma</sl-menu-item>
              <sl-menu-item value="gammaII">Gamma II</sl-menu-item>
              <sl-menu-item value="blue">Blue</sl-menu-item>
              <sl-menu-item value="green">Green</sl-menu-item>
              <sl-menu-item value="orange">Orange</sl-menu-item>
              <sl-menu-item value="purple">Purple</sl-menu-item>
              <sl-menu-item value="red">Red</sl-menu-item>
            </sl-menu>
          </sl-dropdown>

          <sl-dropdown>
            <sl-button slot="trigger" caret>${unsafeSVG(lucideAudioWaveform)} Window Function</sl-button>
            <sl-menu>
              <sl-menu-item value="">None</sl-menu-item>
              <sl-menu-item value="hann" selected>Hann</sl-menu-item>
              <sl-menu-item value="hamming">Hamming</sl-menu-item>
              <sl-menu-item value="lanczos">Lanczos</sl-menu-item>
              <sl-menu-item value="gaussian">Gaussian</sl-menu-item>
              <sl-menu-item value="tukey">Tukey</sl-menu-item>
              <sl-menu-item value="blackman">Blackman</sl-menu-item>
              <sl-menu-item value="exact-blackman">Exact Blackman</sl-menu-item>
              <sl-menu-item value="blackman-harris">Blackman Harris</sl-menu-item>
              <sl-menu-item value="backman-nuttall">Blackman Nuttall</sl-menu-item>
              <sl-menu-item value="kaiser">Kaiser</sl-menu-item>
              <sl-menu-item value="flat-top">Flat Top</sl-menu-item>
            </sl-menu>
          </sl-dropdown>

          <sl-dropdown>
            <sl-button slot="trigger" caret>${unsafeSVG(lucideProportions)} Window Size</sl-button>
            <sl-menu>
              <sl-menu-item value="128">128</sl-menu-item>
              <sl-menu-item value="256">256</sl-menu-item>
              <sl-menu-item value="512" selected>512</sl-menu-item>
              <sl-menu-item value="1024">1024</sl-menu-item>
              <sl-menu-item value="2048">2048</sl-menu-item>
            </sl-menu>
          </sl-dropdown>

          <sl-dropdown>
            <sl-button slot="trigger" caret>${unsafeSVG(lucideBlend)} Window Overlap</sl-button>
            <sl-menu>
              <sl-menu-item value="0" selected>None</sl-menu-item>
              <sl-menu-item value="128">128</sl-menu-item>
              <sl-menu-item value="256">256</sl-menu-item>
              <sl-menu-item value="512">512</sl-menu-item>
              <sl-menu-item value="1024">1024</sl-menu-item>
            </sl-menu>
          </sl-dropdown>

          <sl-dropdown>
            <sl-button slot="target" caret>${unsafeSVG(lucideRuler)} Scale</sl-button>
            <sl-menu>
              <sl-menu-item value="false" selected>Linear</sl-menu-item>
              <sl-menu-item value="true">Mel</sl-menu-item>
            </sl-menu>
          </sl-dropdown>

          <sl-dropdown>
            <sl-button slot="trigger" caret>${unsafeSVG(lucideSun)} Brightness</sl-button>
            <sl-menu>
              <input type="number" value="0" step="0.05" />
            </sl-menu>
          </sl-dropdown>

          <sl-dropdown>
            <sl-button slot="trigger" caret>${unsafeSVG(lucideContrast)} Contrast</sl-button>
            <sl-menu>
              <input type="number" value="1" step="0.05" />
            </sl-menu>
          </sl-dropdown>
        </div>

        <div class="content">${this.currentSettingsTemplate}</div>
      </form>
    `;
  }

  public render() {
    return html`
      <div class="container">
        <a id="action-button" @click="${this.toggleAudio}">
          ${this.isSpectrogramPlaying() ? this.pauseIcon() : this.playIcon()}
        </a>

        ${this.spectrogramSettingsTemplate()}
      </div>
    `;
  }
}
