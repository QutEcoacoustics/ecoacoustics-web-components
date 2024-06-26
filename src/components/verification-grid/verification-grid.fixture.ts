import { Page } from "@playwright/test";
import { test } from "@sand4rt/experimental-ct-web";

class VerificationGridFixture {
  public constructor(public readonly page: Page) {}

  public async create() {
    await this.page.setContent(`
      <oe-verification-grid></oe-verification-grid>
    `);
    await this.page.waitForLoadState("networkidle");
  }
}

export const verificationGridFixture = test.extend<{ fixture: VerificationGridFixture }>({
  fixture: async ({ page }, run) => {
    const fixture = new VerificationGridFixture(page);
    await run(fixture);
  },
});
