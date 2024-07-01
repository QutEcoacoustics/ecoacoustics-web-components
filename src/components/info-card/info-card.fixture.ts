import { Page } from "@playwright/test";
import { test } from "@sand4rt/experimental-ct-web";
import { Verification, VerificationDecision, VerificationSubject } from "../../models/verification";
import { getBrowserValue, setBrowserValue } from "../../tests/helpers";
import { InfoCard } from "./info-card";

class TestPage {
  public constructor(public readonly page: Page) {}

  public component = () => this.page.locator("oe-info-card").first();
  public downloadRecordingButton = () => this.page.locator("#download-recording");
  public showMoreButton = () => this.page.locator("#show-more");
  public subjectContent = () => this.page.locator(".subject-content");

  public async create() {
    await this.page.setContent(`<oe-info-card></oe-info-card>`);
  }

  public async changeSubject(subject: VerificationSubject) {
    const model = new Verification({
      subject,
      url: "http://localhost:5173/example.flac",
      tag: { id: undefined, text: "example" },
      confirmed: VerificationDecision.TRUE,
      additionalTags: [],
    });

    await setBrowserValue<InfoCard>(this.component(), "model", model);
  }

  public async subjectUrl(): Promise<string> {
    const model = (await getBrowserValue<InfoCard>(this.component(), "model")) as Verification;
    return model.url;
  }

  public async infoCardItems() {
    const element = this.subjectContent();

    return await element.evaluate((el) => {
      return Array.from(el.children).map((child) => {
        return {
          key: child.querySelector(".subject-key")?.textContent,
          value: child.querySelector(".subject-value")?.textContent,
        };
      });
    });
  }
}

export const infoCardFixture = test.extend<{ fixture: TestPage }>({
  fixture: async ({ page }, run) => {
    const fixture = new TestPage(page);
    await fixture.create();
    await run(fixture);
  },
});
