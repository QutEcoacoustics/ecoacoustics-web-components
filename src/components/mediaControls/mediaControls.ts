import { LitElement, PropertyValues, TemplateResult, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { mediaControlsStyles } from "./css/style";
import { ILogger, rootContext } from "../logger/logger";
import { provide } from "@lit/context";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { AbstractComponent } from "../../mixins/abstractComponent";
import { Spectrogram } from "spectrogram/spectrogram";
import { SlMenuItem } from "@shoelace-style/shoelace";
import { SpectrogramOptions } from "../../helpers/audio/models";
import lucidPlayIcon from "lucide-static/icons/play.svg?raw";
import lucidPauseIcon from "lucide-static/icons/pause.svg?raw";
import lucideSettingsIcon from "lucide-static/icons/settings.svg?raw";
import lucidePalletteIcon from "lucide-static/icons/palette.svg?raw";
import lucideSunIcon from "lucide-static/icons/sun.svg?raw";
import lucideContrastIcon from "lucide-static/icons/contrast.svg?raw";

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

  @property({ type: String })
  public for = "";

  @provide({ context: rootContext })
  public logger: ILogger = {
    log: console.log,
  };

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

  private playIcon() {
    return html`<slot name="play-icon" part="play-icon">${unsafeSVG(lucidPlayIcon)}</slot>`;
  }

  private pauseIcon() {
    return html`<slot name="pause-icon" part="pause-icon">${unsafeSVG(lucidPauseIcon)}</slot>`;
  }

  private selectSettingsTemplate(key: keyof SpectrogramOptions, text: any, values: string[]): TemplateResult<1> {
    const changeHandler = (event: CustomEvent<{ item: SlMenuItem }>) => {
      const newValue = event.detail.item.value;

      const oldOptions = this.spectrogramElement!.spectrogramOptions;
      this.spectrogramElement!.spectrogramOptions = {
        ...oldOptions,
        [key]: newValue,
      } as any;
    };

    return html`
      <sl-menu-item>
        ${text}
        <sl-menu @sl-select="${changeHandler}" slot="submenu">
          ${values.map((value: string) => html`<sl-menu-item value="${value}">${value}</sl-menu-item>`)}
        </sl-menu>
      </sl-menu-item>
    `;
  }

  private additionalSettingsTemplate(): TemplateResult<1> {
    return html`
      <sl-dropdown title="Additional Settings" hoist>
        <button slot="trigger">${unsafeSVG(lucideSettingsIcon)}</button>
        <sl-menu>
          ${this.selectSettingsTemplate("windowFunction", "Window Function", [
            "hann",
            "hamming",
            "cosine",
            "lanczos",
            "gaussian",
            "tukey",
            "blackman",
            "exact_blackman",
            "kaiser",
            "nuttall",
            "blackman_harris",
            "blackman_nuttall",
            "flat_top",
          ])}
          ${this.selectSettingsTemplate("windowSize", "Window Size", ["128", "256", "512", "1024", "2048"])}
          ${this.selectSettingsTemplate("melScale", "Scale", ["linear", "mel"])}
        </sl-menu>
      </sl-dropdown>
    `;
  }

  private spectrogramSettingsTemplate(): TemplateResult<1> {
    const changeColorHandler = (event: CustomEvent<{ item: SlMenuItem }>) => {
      const newValue = event.detail.item.value;

      const oldOptions = this.spectrogramElement!.spectrogramOptions;
      this.spectrogramElement!.spectrogramOptions = {
        ...oldOptions,
        colorMap: newValue,
      } as any;
    };

    const changeBrightnessHandler = (event: CustomEvent) => {
      const newValue = (event.target as HTMLInputElement).value;

      const oldOptions = this.spectrogramElement!.spectrogramOptions;
      this.spectrogramElement!.spectrogramOptions = {
        ...oldOptions,
        brightness: newValue,
      } as any;
    };

    const changeContrastHandler = (event: CustomEvent) => {
      const newValue = (event.target as HTMLInputElement).value;

      const oldOptions = this.spectrogramElement!.spectrogramOptions;
      this.spectrogramElement!.spectrogramOptions = {
        ...oldOptions,
        contrast: newValue,
      } as any;
    };

    return html`
      <sl-dropdown title="Colour" hoist>
        <button slot="trigger">${unsafeSVG(lucidePalletteIcon)}</button>
        <sl-menu @sl-select="${changeColorHandler}">
          <sl-menu-item value="grayscale">Grayscale</sl-menu-item>
          <sl-menu-item value="audacity">Audacity</sl-menu-item>
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

      <sl-dropdown title="Brightness" hoist>
        <button slot="trigger">${unsafeSVG(lucideSunIcon)}</button>
        <input @change="${changeBrightnessHandler}" type="number" step="0.1" placeholder="0" />
      </sl-dropdown>

      <sl-dropdown title="Contrast" hoist>
        <button slot="trigger">${unsafeSVG(lucideContrastIcon)}</button>
        <input @change="${changeContrastHandler}" type="number" step="0.1" placeholder="1" />
      </sl-dropdown>

      ${this.additionalSettingsTemplate()}
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
