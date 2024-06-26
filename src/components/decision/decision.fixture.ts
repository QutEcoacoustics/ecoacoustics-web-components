import { Page } from "@playwright/test";
import { test } from "@sand4rt/experimental-ct-web";
import { removeBrowserAttribute, setBrowserAttribute } from "../../tests/helpers";
import { Decision } from "./decision";
import { SelectionObserverType } from "..";

class DecisionFixture {
  public constructor(public readonly page: Page) {}

  public component = () => this.page.locator("oe-decision");
  public decisionButton = () => this.page.locator("#decision-button");

  public async create() {
    await this.page.setContent(`
      <oe-decision></oe-decision>
    `);
    await this.page.waitForLoadState("networkidle");
  }

  // change attributes
  public async changeDecisionColor(color: string) {
    await setBrowserAttribute<Decision>(this.component(), "color", color);
  }

  public async changeDecisionTag(tag: string) {
    await setBrowserAttribute<Decision>(this.component(), "tag", tag);
  }

  public async changeDecisionShortcut(shortcut: string) {
    await setBrowserAttribute<Decision>(this.component(), "shortcut", shortcut);
  }

  public async changeDecisionAdditionalTags(additionalTags: string) {
    await setBrowserAttribute<Decision>(this.component(), "additionalTags", additionalTags);
  }

  public async changeDecisionDisabled(disabled: boolean) {
    const disabledAttributeName = "disabled";

    if (disabled) {
      await removeBrowserAttribute<Decision>(this.component(), disabledAttributeName);
      return;
    }

    await setBrowserAttribute<Decision>(this.component(), disabledAttributeName);
  }

  public async changeDecisionTabletSelection(tabletSelection: SelectionObserverType) {
    await setBrowserAttribute<Decision>(this.component(), "selectionMode", tabletSelection);
  }

  public async changeDecisionVerified(value: boolean) {
    await setBrowserAttribute<Decision>(this.component(), "verified", value.toString());
  }

  public async changeKeyboardShortcut(value: string) {
    await setBrowserAttribute<Decision>(this.component(), "shortcut", value);
  }

  public async changeDecisionType(value: "skip" | "unsure" | "all") {
    const possibleValues: (keyof Decision)[] = ["skip", "unsure", "all"];
    for (const possibleValue of possibleValues) {
      await removeBrowserAttribute<Decision>(this.component(), possibleValue);
    }

    await setBrowserAttribute<Decision>(this.component(), value);
  }
}

export const decisionFixture = test.extend<{ fixture: DecisionFixture }>({
  fixture: async ({ page }, run) => {
    const fixture = new DecisionFixture(page);
    await run(fixture);
  },
});
