import { Page } from "@playwright/test";
import { test } from "@sand4rt/experimental-ct-web";
import { setBrowserAttribute } from "../helpers";

class TestPage {
  public constructor(public readonly page: Page) {}

  public gridComponent = () => this.page.locator("oe-verification-grid").first();
  public helpDialog = () => this.page.locator("oe-help-dialog").first();
  public decisionButtons = () => this.page.locator("oe-decision").first();

  public async create() {
    await this.page.setContent(``);
    await this.page.waitForLoadState("networkidle");
  }

  // getters
  public async getGridSize(): Promise<number> {
    return 0;
  }

  // actions
  public async nextPage() {}

  public async openHelpDialog() {}

  public async selectFile() {}

  public async downloadResults() {}

  public async createSubSelection() {}

  public async makeDecision() {}

  public async viewPreviousHistoryPage() {}

  public async viewNextHistoryPage() {}

  public async continueVerifying() {}

  // change attributes
  public async changeGridSize(value: number) {
    await setBrowserAttribute<VerificationGridComponent>(this.gridComponent(), "autoPage", value);
  }

  public async changeScreenSize() {}

  public async changeGridSource() {}

  public async changeGridKey() {}

  public async changeAutoPage(value: boolean) {
    await setBrowserAttribute<VerificationGridComponent>(this.gridComponent(), "autoPage", value);
  }
}

export const verificationGridFixture = test.extend<{ fixture: TestPage }>({
  fixture: async ({ page }, run) => {
    const fixture = new TestPage(page);
    await fixture.create();
    await run(fixture);
  },
});
