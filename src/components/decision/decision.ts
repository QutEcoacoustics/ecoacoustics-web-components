import { html, LitElement, nothing, unsafeCSS } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { AbstractComponent } from "../../mixins/abstractComponent";
import decisionStyles from "./css/style.css?inline";
import { classMap } from "lit/directives/class-map.js";
import { SelectionObserverType } from "../verification-grid/verification-grid";
import { booleanConverter } from "../../helpers/attributes";
import { VerificationDecision } from "../../models/verification";

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
  public static styles = unsafeCSS(decisionStyles);

  @property({ type: Boolean, converter: booleanConverter })
  public verified: boolean | undefined;

  @property({ type: Boolean, converter: booleanConverter })
  public all: boolean | undefined;

  @property({ type: Boolean, converter: booleanConverter })
  public skip: boolean | undefined;

  @property({ type: Boolean, converter: booleanConverter })
  public unsure: boolean | undefined;

  @property({ type: String, reflect: true })
  public tag: string | undefined;

  @property({ type: String, reflect: true })
  public shortcut: string | undefined;

  @property({ type: String })
  public color = "var(--oe-primary-color)";

  @property({ attribute: "additional-tags", type: String, reflect: true })
  public additionalTags: string | undefined;

  @property({ attribute: "disabled", type: Boolean, converter: booleanConverter, reflect: true })
  public disabled = false;

  @property({ type: Boolean })
  public get showDecisionColor(): boolean {
    return this._showDecisionColor && !this.disabled;
  }
  public set showDecisionColor(value: boolean) {
    if (this.disabled) {
      return;
    }

    const oldValue = this._showDecisionColor;
    this._showDecisionColor = value;
    this.requestUpdate("showDecisionColor", oldValue);
  }

  @query("#decision-button")
  private decisionButton!: HTMLButtonElement;

  @state()
  public selectionMode: SelectionObserverType = "desktop";
  private _showDecisionColor = false;

  public get verificationDecision(): VerificationDecision {
    switch (true) {
      case this.verified === true:
        return VerificationDecision.TRUE;
      case this.verified === false:
        return VerificationDecision.FALSE;
      case this.skip === true:
        return VerificationDecision.SKIP;
      case this.unsure === true:
        return VerificationDecision.UNSURE;
      default:
        return VerificationDecision.FALSE;
    }
  }

  private keyUpHandler = this.handleKeyUp.bind(this);
  private keyDownHandler = this.handleKeyDown.bind(this);
  private shouldEmitNext = true;

  public connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("keydown", this.keyDownHandler);
    document.addEventListener("keyup", this.keyUpHandler);
  }

  public disconnectedCallback(): void {
    document.removeEventListener("keydown", this.keyDownHandler);
    document.removeEventListener("keyup", this.keyUpHandler);
    super.disconnectedCallback();
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (event.key.toLocaleLowerCase() === "escape") {
      return;
    }

    if (this.isShortcutKey(event)) {
      this.emitDecision();
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.isShortcutKey(event)) {
      this.setShowDecisionColor(true);
    }

    // if the user is holding down escape while pressing a shortcut, we should
    // not trigger the decision
    // this can happen because we are listening to the keyup event
    // meaning that the user can hold down the trigger key, decide against it
    // and then release the trigger key while holding down the escape key
    // to cancel creating the decision
    if (event.key.toLocaleLowerCase() === "escape") {
      this.shouldEmitNext = false;
    }
  }

  private setShowDecisionColor(value: boolean): void {
    if (this.disabled) {
      return;
    }

    this.showDecisionColor = value;
  }

  private isShortcutKey(event: KeyboardEvent): boolean {
    if (this.shortcut === undefined) {
      return false;
    }

    return event.key.toLowerCase() === this.shortcut.toLowerCase();
  }

  private emitDecision(): void {
    this.setShowDecisionColor(false);

    if (this.disabled) {
      return;
    }

    if (!this.shouldEmitNext) {
      this.shouldEmitNext = true;
      return;
    }
    this.shouldEmitNext = true;

    const additionalTags = this.additionalTags?.split(",").map((tag) => tag.trim()) ?? [];

    // I focus on the button clicked with keyboard shortcuts
    // so that the user gets some visual feedback on what button they clicked
    // it also mimics the user clicking on the button where it would be focused
    // after clicking
    this.decisionButton.focus();

    this.dispatchEvent(
      new CustomEvent(Decision.decisionEventName, {
        detail: {
          value: this.verificationDecision,
          tag: this.tag,
          additionalTags,
          color: this.color,
          target: this,
        },
        bubbles: true,
      }),
    );
  }

  public render() {
    const additionalTagsTemplate = this.additionalTags ? html`(${this.additionalTags})` : nothing;
    const keyboardLegend =
      this.shortcut && this.selectionMode !== "tablet" ? html`<kbd>${this.shortcut.toUpperCase()}</kbd>` : nothing;

    return html`
      <button
        id="decision-button"
        class="
          oe-btn-primary
          ${classMap({ disabled: !!this.disabled, "show-decision-color": this.showDecisionColor })}
        "
        style="--decision-color: ${this.color}"
        part="decision-button"
        title="Shortcut: ${this.shortcut}"
        aria-disabled="${this.disabled}"
        @pointerdown="${() => this.setShowDecisionColor(true)}"
        @pointerup="${this.emitDecision}"
      >
        <div class="tag-text"><slot></slot></div>
        <div class="additional-tags">${additionalTagsTemplate}</div>
        ${this.selectionMode !== "tablet" ? html`<div class="keyboard-legend">${keyboardLegend}</div>` : nothing}
      </button>
    `;
  }

  public static decisionEventName = "decision" as const;
}

declare global {
  interface HTMLElementTagNameMap {
    "oe-decision": Decision;
  }
}
