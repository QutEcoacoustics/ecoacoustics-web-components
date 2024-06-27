import { Page } from "@playwright/test";
import { test } from "@sand4rt/experimental-ct-web";
import { getBrowserStyles, getBrowserValue, setBrowserValue } from "../../tests/helpers";
import { VerificationGridTile } from "./verification-grid-tile";

class VerificationGridTileFixture {
  public constructor(public readonly page: Page) {}

  public component = () => this.page.locator("oe-verification-grid-tile");
  public tileContainer = () => this.component().locator(".tile-container").first();

  public async create() {
    await this.page.setContent(`<oe-verification-grid-tile></oe-verification-grid-tile>`);
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForSelector("oe-verification-grid-tile");
  }

  public async isSelected() {
    return await getBrowserValue<VerificationGridTile>(this.component(), "selected");
  }

  // TODO: Fix this
  public async getSelectionShortcut(): Promise<string> {
    return ((await getBrowserValue<VerificationGridTile>(this.component(), "shortcuts")) as string[]).at(-1) ?? "";
  }

  public async getDecisionColor() {
    return await getBrowserValue<VerificationGridTile>(this.component(), "color");
  }

  public async getTileStyles() {
    return await getBrowserStyles<HTMLDivElement>(this.tileContainer());
  }

  // actions
  public async mouseSelectSpectrogramTile() {
    await this.tileContainer().click();
  }

  public async keyboardSelectSpectrogramTile() {
    const keyboardShortcut = await this.getSelectionShortcut();
    await this.page.keyboard.press(keyboardShortcut);
  }

  public async setDecisionColor(value: string) {
    await setBrowserValue<VerificationGridTile>(this.tileContainer(), "color", value);
  }
}

export const verificationGridTileFixture = test.extend<{ fixture: VerificationGridTileFixture }>({
  fixture: async ({ page }, run) => {
    const fixture = new VerificationGridTileFixture(page);
    await run(fixture);
  },
});
