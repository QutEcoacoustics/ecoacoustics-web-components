import { Page } from "@playwright/test";
import { test } from "@sand4rt/experimental-ct-web";
import { catchEvent, getBrowserValue, removeBrowserAttribute, setBrowserAttribute } from "../../tests/helpers";
import { Decision } from "./decision";
import { SelectionObserverType } from "../verification-grid/verification-grid";

class DecisionFixture {
  public constructor(public readonly page: Page) {}

  public component = () => this.page.locator("oe-decision");
  public decisionButton = () => this.page.locator("#decision-button");
  public tagLegend = () => this.decisionButton().locator(".tag-text").first();
  public additionalTagsLegend = () => this.decisionButton().locator(".additional-tags").first();
  public shortcutLegend = () => this.decisionButton().locator(".keyboard-legend").first();

  public async create() {
    await this.page.setContent(`<oe-decision></oe-decision>`);
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForSelector("oe-decision");
  }

  // events
  public decisionEvent() {
    // for some reason, we can't use the static decisionEventName property from
    // the Decision class here because
    return catchEvent(this.page, "decision");
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
    // TODO: remove this type casting that is only needed because we are
    // checking properties instead of attributes in this helper
    await setBrowserAttribute<Decision>(this.component(), "additional-tags" as keyof Decision, additionalTags);
  }

  public async changeDecisionDisabled(disabled: boolean) {
    const disabledAttributeName = "disabled";

    if (!disabled) {
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

  // get page properties
  public async isShowingDecisionColor(): Promise<boolean> {
    // TODO: this type casting is only needed because the return type of this
    // helper is incorrect
    return (await getBrowserValue<Decision>(this.component(), "showDecisionColor")) as boolean;
  }

  public async decisionTagText(): Promise<string | null> {
    return await this.tagLegend().textContent();
  }

  public async additionalTagsText(): Promise<string | null> {
    return await this.additionalTagsLegend().textContent();
  }

  public async shortcutText(): Promise<string | null> {
    return await this.shortcutLegend().textContent();
  }
}

export const decisionFixture = test.extend<{ fixture: DecisionFixture }>({
  fixture: async ({ page }, run) => {
    const fixture = new DecisionFixture(page);
    await run(fixture);
  },
});
