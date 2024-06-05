import { customElement, property, state } from "lit/decorators.js";
import { AbstractComponent } from "../../mixins/abstractComponent";
import { html, LitElement, PropertyValues } from "lit";
import { PageFetcher, VerificationGrid } from "../verification-grid/verification-grid";
import { dataSourceStyles } from "./css/style";

@customElement("oe-data-source")
export class DataSource extends AbstractComponent(LitElement) {
  public static styles = dataSourceStyles;

  @property()
  public src: string | undefined;

  @property()
  public for: string | undefined;

  @state()
  private verificationGrid: VerificationGrid | undefined;

  public willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("for") && !!this.for) {
      const verificationElement = document.querySelector<VerificationGrid>(`#${this.for}`);

      if (verificationElement) {
        this.verificationGrid = verificationElement;
      }
    }
  }

  private constructedSrcCallback(): PageFetcher {
    return async (elapsedItems: number) => {
      // TODO: add support for local files maybe through a new file picker component
      // called oe-local-data with a `for` attribute
      const response = await fetch(src);

      if (!response.ok) {
        throw new Error("Could not fetch page");
      }

      const data: string = await response.text();

      // TODO: we should be using the headers to inspect the file type
      // if the file type cannot be determined by the header, then we should only
      // use the first byte as a fallback heuristic
      const jsonData = this.fileFormat(data) === "json" ? JSON.parse(data) : await csv().fromString(data);

      // TODO: Check if this is the correct solution
      if (!Array.isArray(jsonData)) {
        throw new Error("Response is not an array");
      }

      const startIndex = elapsedItems;
      const endIndex = startIndex + this.gridSize;

      return jsonData.slice(startIndex, endIndex) ?? [];
    };
  }

  private updateVerificationGrid(): void {
    if (!this.verificationGrid) {
      return;
    }
  }

  public render() {
    return html`<input type="file" />`;
  }
}
