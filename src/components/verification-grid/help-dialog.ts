import { customElement, property, query, state } from "lit/decorators.js";
import { AbstractComponent } from "../../mixins/abstractComponent";
import { html, LitElement, nothing, TemplateResult } from "lit";
import { Decision } from "../decision/decision";
import { helpDialogStyles } from "./css/help-dialog-styles";

interface KeyboardShortcut {
  key: string;
  description: string;
}

const helpPreferenceLocalStorageKey = "oe-verification-grid-dialog-preferences";

@customElement("oe-verification-help-dialog")
export class VerificationHelpDialog extends AbstractComponent(LitElement) {
  static styles = helpDialogStyles;

  @property({ type: Array })
  public decisionElements!: Decision[];

  @state()
  private showRememberOption = true;

  @query("#help-dialog")
  private helpDialogElement!: HTMLDialogElement;

  public firstUpdated(): void {
    const shouldShowHelpDialog = localStorage.getItem(helpPreferenceLocalStorageKey) === null;

    if (shouldShowHelpDialog) {
      this.helpDialogElement.showModal();
    }

    console.log("decision elements", this.decisionElements);
  }

  public showModal(showRememberOption = true) {
    this.showRememberOption = showRememberOption;
    this.helpDialogElement.showModal();
  }

  // TODO: narrow the typing here
  private closeHelpDialog(): void {
    const dialogPreference = this.shadowRoot!.getElementById("dialog-preference") as HTMLInputElement;
    const shouldShowDialog = !dialogPreference.checked;

    if (!shouldShowDialog) {
      localStorage.setItem(helpPreferenceLocalStorageKey, "true");
    } else {
      localStorage.removeItem(helpPreferenceLocalStorageKey);
    }
  }

  private keyboardShortcutTemplate(shortcuts: KeyboardShortcut[]): TemplateResult<1> {
    // TODO: fix this hack for putting plus signs between keys
    return html`
      <div class="keyboard-shortcuts">
        ${shortcuts.map(
          (shortcut) => html`<div class="row">
            ${shortcut.key
              .split("+")
              .map((key, i, { length }) => html`<kbd class="key">${key}</kbd> ${i !== length - 1 ? "+" : nothing}`)}
            <span class="description">${shortcut.description}</span>
          </div>`,
        )}
      </div>
    `;
  }

  public render() {
    const selectionKeyboardShortcuts: KeyboardShortcut[] = [
      { key: "Ctrl + A", description: "Select all items" },
      { key: "Shift + Click", description: "Add a range of items to the sub-selection" },
      { key: "Ctrl + Click", description: "Toggle the selection of a single item" },
      { key: "Ctrl + Shift + Click", description: "Select a range of items" },
      { key: "Esc", description: "Deselect all items" },
    ];

    // decision shortcuts are fetched from the decision elements
    // TODO: fix this
    const decisionShortcuts: KeyboardShortcut[] = [
      ...(this.decisionElements?.map((element) => {
        return { key: element.shortcut, description: element.innerText };
      }) ?? []),
    ] as any;

    // TODO: there are some hacks in here to handle closing the modal when the user clicks off
    return html`
      <dialog id="help-dialog" @click="${() => this.helpDialogElement.close()}" @close="${this.closeHelpDialog}">
        <div class="dialog-container" @click="${(event: PointerEvent) => event.stopPropagation()}">
          <div class="dialog-content">
            <section>
              <h1>Information</h1>
              <p>
                The Verification grid is a tool to help you validate and verify audio events either generated by a
                machine learning model or by a human annotator.
              </p>
            </section>

            <section>
              <h2>Decisions</h2>
              ${this.keyboardShortcutTemplate(decisionShortcuts)}
            </section>

            <section>
              <h2>Sub-Selection</h2>
              <p>
                You can apply a decision to only a few items in the grid by clicking on them, or using one of the
                keyboard shortcuts below.
              </p>

              <p>
                You can also use <kbd>Alt</kbd> + <math>a number</math> (e.g. <kbd>Alt</kbd> + <kbd>1</kbd>) to select a
                tile using you keyboard. It is possible to see the possible keyboard shortcuts for selection by holding
                down the <kbd>Alt</kbd> key.
              </p>

              <h3>Keyboard Shortcuts</h3>
              ${this.keyboardShortcutTemplate(selectionKeyboardShortcuts)}
            </section>
          </div>

          <hr />

          <form class="dialog-controls" method="dialog">
            <label class="show-again">
              ${this.showRememberOption
                ? html`
                    <input
                      id="dialog-preference"
                      name="dialog-preference"
                      type="checkbox"
                      ?checked="${localStorage.getItem(helpPreferenceLocalStorageKey) !== null}"
                    />
                    Do not show this dialog again
                  `
                : nothing}
            </label>
            <button class="oe-btn oe-btn-primary close-btn" type="submit" autofocus>Close</button>
          </form>
        </div>
      </dialog>
    `;
  }
}
