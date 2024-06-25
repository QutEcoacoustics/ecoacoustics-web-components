import { Page } from "@playwright/test";
import { test } from "@sand4rt/experimental-ct-web";

class TestPage {
  public constructor(public readonly page: Page) {}

  public component = () => this.page.locator("oe-info-card").first();

  public async create() {
    await this.page.setContent(`<oe-info-card></oe-info-card>`);
  }
}

export const infoCardFixture = test.extend<{ fixture: TestPage }>({
  fixture: async ({ page }, run) => {
    const fixture = new TestPage(page);
    await fixture.create();
    await run(fixture);
  },
});
