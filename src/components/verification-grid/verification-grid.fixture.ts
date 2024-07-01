import { Page } from "@playwright/test";
import { test } from "@sand4rt/experimental-ct-web";
import { setBrowserAttribute } from "../../tests/helpers";
import { VerificationGrid } from "./verification-grid";

class VerificationGridFixture {
  public constructor(public readonly page: Page) {}

  public component = () => this.page.locator("oe-verification-grid");
  public templateElements = () => this.component().locator(".template-element").all();
  public helpDialogButton = () => void 0;

  public async create() {
    await this.page.setContent(`
      <oe-verification-grid>
        <template>
          <div class="template-element"></div>
        </template>

        <oe-data-source src="http://localhost:3000/grid-items.json">
        </oe-data-source>
      </oe-verification-grid>
    `);
    await this.page.waitForLoadState("networkidle");
  }

  public async setGridSize(value: number) {
    await setBrowserAttribute(this.component(), "grid-size" as keyof VerificationGrid, value.toString());
  }
}

export const verificationGridFixture = test.extend<{ fixture: VerificationGridFixture }>({
  fixture: async ({ page }, run) => {
    const fixture = new VerificationGridFixture(page);
    await run(fixture);
  },
});
