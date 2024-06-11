import { html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { AbstractComponent } from "../../mixins/abstractComponent";
import { decisionStyles } from "./css/style";
import { classMap } from "lit/directives/class-map.js";
import { SelectionObserverType } from "../verification-grid/verification-grid";
import { booleanConverter } from "../../helpers/attributes";

/**
 * A decision that can be made either with keyboard shortcuts or by clicking
 * on the element
 *
 * @property verified - The value of the decision
 * @property shortcut - The keyboard shortcut to trigger the decision
 * @property additional-tags - Additional tags to add to the decision
 *
 * @csspart decision-button - The button that triggers the decision
 *
 * @slot - The content of the decision
 */
@customElement("oe-decision")
export class Decision extends AbstractComponent(LitElement) {
  public static styles = decisionStyles;

  @property({ type: Boolean, reflect: true, converter: booleanConverter })
  public verified: boolean | undefined;

  @property({ type: String, reflect: true })
  public tag: string | undefined;

  @property({ type: String, reflect: true })
  public shortcut: string | undefined;

  @property({ type: String })
  public color = "var(--oe-primary-color)";

  @property({ attribute: "additional-tags", type: String, reflect: true })
  public additionalTags: string | undefined;

  @property({ attribute: "disabled", type: Boolean, reflect: true })
  public disabled: boolean | undefined;

  @property({ type: Boolean, converter: booleanConverter })
  public all: boolean | undefined;

  @property({ type: Boolean, converter: booleanConverter })
  public skip: boolean | undefined;

  @query("#decision-button")
  private decisionButton!: HTMLButtonElement;

  @state()
  public selectionMode: SelectionObserverType = "desktop";

  private shortcutHandler = this.handleKeyDown.bind(this);

  public connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("keyup", this.shortcutHandler);
  }

  public disconnectedCallback(): void {
    document.removeEventListener("keyup", this.shortcutHandler);
    super.disconnectedCallback();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.shortcut === undefined) {
      return;
    }

    if (event.key.toLocaleLowerCase() === this.shortcut.toLocaleLowerCase()) {
      this.emitDecision();
    }
  }

  private emitDecision(): void {
    if (this.disabled) {
      return;
    }

    // when we are making decisions for with multiple classes, we emit
    // the OE Verification model for every tag option
    // the same logic should be used for a single tag, but it should only emit
    // one tag (because there is only one tag)
    const additionalTags = this.additionalTags?.split(",").map((tag) => tag.trim()) ?? [];

    // I focus on the button clicked with keyboard shortcuts
    // so that the user gets some visual feedback on what button they clicked
    // it also mimics the user clicking on the button where it would be focused
    // after clicking
    this.decisionButton.focus();

    this.dispatchEvent(
      new CustomEvent("decision", {
        detail: {
          value: this.verified,
          tag: this.tag,
          color: this.color,
          additionalTags,
        },
        bubbles: true,
      }),
    );
  }

  public render() {
    const additionalTagsTemplate = this.additionalTags ? html`(${this.additionalTags})` : nothing;
    const keyboardLegend =
      this.shortcut && this.selectionMode === "desktop" ? html`<kbd>${this.shortcut.toUpperCase()}</kbd>` : nothing;

    return html`
      <button
        id="decision-button"
        class="${classMap({ disabled: !!this.disabled })}"
        style="--decision-color: ${this.color}"
        part="decision-button"
        title="Shortcut: ${this.shortcut}"
        aria-disabled="${this.disabled}"
        @click="${this.emitDecision}"
      >
        <div class="tag-text"><slot></slot></div>
        <div class="additional-tags">${additionalTagsTemplate}</div>
        <div class="keyboard-legend">${keyboardLegend}</div>
      </button>
    `;
  }
}
