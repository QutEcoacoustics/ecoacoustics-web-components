import { LitElement, PropertyValues, TemplateResult, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { mediaControlsStyles } from "./css/style";
import { ILogger, rootContext } from "../logger/logger";
import { provide } from "@lit/context";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { AbstractComponent } from "../../mixins/abstractComponent";
import { Spectrogram } from "spectrogram/spectrogram";
import { SpectrogramOptions } from "../../helpers/audio/models";
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
  private currentSetting: string | null = null;

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

  private preferencesTemplate(title: string, summaryTemplate: any, template: TemplateResult<1>) {
    return html`
      <span>
        <a
          title="${title}"
          @click="${() => {
            const isCurrentlySelected = this.currentSetting === title;

            !isCurrentlySelected ? (this.currentSettingsTemplate = template) : (this.currentSettingsTemplate = null);

            this.currentSetting = isCurrentlySelected ? null : title;
          }}"
        >
          ${summaryTemplate}
        </a>
      </span>
    `;
  }

  private spectrogramSettingsTemplate(): TemplateResult<1> {
    return html`
      <form id="spectrogram-settings" @change="${this.updateSpectrogramOptions}">
        <div class="settings-menu">
          ${this.preferencesTemplate(
            "Colour Pallette",
            unsafeSVG(lucidePalette),
            html`
              <label>
                Colour Pallette
                <select name="colorMap">
                  <option value="grayscale">Grayscale</option>
                  <option value="audacity" selected>Audacity</option>
                  <option value="raven">Raven</option>
                  <option value="cubeHelix">Cube Helix</option>
                  <option value="viridis">Viridis</option>
                  <option value="turbo">Turbo</option>
                  <option value="plasma">Plasma</option>
                  <option value="inferno">Inferno</option>
                  <option value="magma">Magma</option>
                  <option value="gammaII">Gamma II</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="orange">Orange</option>
                  <option value="purple">Purple</option>
                  <option value="red">Red</option>
                </select>
              </label>
            `,
          )}
          ${this.preferencesTemplate(
            "Window Function",
            unsafeSVG(lucideAudioWaveform),
            html`
              <label>
                Window Function
                <select name="windowFunction">
                  <option value="">None</option>
                  <option value="hann" selected>Hann</option>
                  <option value="hamming">Hamming</option>
                  <option value="lanczos">Lanczos</option>
                  <option value="gaussian">Gaussian</option>
                  <option value="tukey">Tukey</option>
                  <option value="blackman">Blackman</option>
                  <option value="exact-blackman">Exact Blackman</option>
                  <option value="blackman-harris">Blackman Harris</option>
                  <option value="backman-nuttall">Blackman Nuttall</option>
                  <option value="kaiser">Kaiser</option>
                  <option value="flat-top">Flat Top</option>
                </select>
              </label>
            `,
          )}
          ${this.preferencesTemplate(
            "Window Size",
            unsafeSVG(lucideProportions),
            html`
              <label>
                Window Size
                <select name="windowSize">
                  <option value="128">128</option>
                  <option value="256">256</option>
                  <option value="512" selected>512</option>
                  <option value="1024">1024</option>
                  <option value="2048">2048</option>
                </select>
              </label>
            `,
          )}
          ${this.preferencesTemplate(
            "Window Overlap",
            unsafeSVG(lucideBlend),
            html`
              <label>
                Window Overlap
                <select name="windowOverlap">
                  <option value="0" selected>None</option>
                  <option value="128">128</option>
                  <option value="256">256</option>
                  <option value="512">512</option>
                  <option value="1024">1024</option>
                </select>
              </label>
            `,
          )}
          ${this.preferencesTemplate(
            "Scale",
            unsafeSVG(lucideRuler),
            html`
              <label>
                Scale
                <select name="melScale">
                  <option value="false" selected>Linear</option>
                  <option value="true">Mel</option>
                </select>
              </label>
            `,
          )}
          ${this.preferencesTemplate(
            "Brightness",
            unsafeSVG(lucideSun),
            html`
              <label>
                Brightness
                <input type="number" value="0" step="0.05" name="brightness" />
              </label>
            `,
          )}
          ${this.preferencesTemplate(
            "Contrast",
            unsafeSVG(lucideContrast),
            html`
              <label>
                Contrast
                <input type="number" value="1" step="0.05" name="contrast" />
              </label>
            `,
          )}
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
