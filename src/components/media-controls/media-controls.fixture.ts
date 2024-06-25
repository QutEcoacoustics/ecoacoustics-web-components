import { Page } from "@playwright/test";
import { test } from "@sand4rt/experimental-ct-web";
import { MediaControls } from "./media-controls";
import { Spectrogram } from "../spectrogram/spectrogram";

class TestPage {
  public constructor(public readonly page: Page) {}

  public component = () => this.page.locator("oe-media-controls").first();
  public actionButton = this.page.locator("oe-media-controls #action-button").first();
  public actionButtonSlot = () => this.page.locator("oe-media-controls #action-button > slot").first();
  public spectrogram = () => this.page.locator("oe-spectrogram").first();

  public async create(slotTemplate = "") {
    await this.page.setContent(`
        <oe-spectrogram
          id="spectrogram"
          src="http://localhost:3000/example.flac"
          style="display: relative; width: 100px; height: 100px;"
        ></oe-spectrogram>
        <oe-media-controls for="spectrogram">
            ${slotTemplate ?? ""}
        </oe-media-controls>
    `);
    await this.page.waitForLoadState("networkidle");
  }

  public async updateSlot(content: string) {
    const componentElement = this.component();
    await componentElement.evaluate((element: MediaControls, content: string) => {
      element.innerHTML = content;
    }, content);
  }

  public async toggleAudio() {
    const actionButtonElement = this.actionButton;
    await actionButtonElement.click({ force: true });
  }

  public async isPlayingAudio() {
    const audioElement = this.spectrogram();
    return await audioElement.evaluate((element: Spectrogram) => !element.paused);
  }

  public async actionButtonSlotText(): Promise<(string | null)[]> {
    const actionButtonSlotElement = this.actionButtonSlot();
    return await actionButtonSlotElement.evaluate((element: HTMLSlotElement) =>
      element.assignedElements().map((element) => element.textContent),
    );
  }

  public async actionButtonStyles() {
    const actionButtonElement = this.actionButtonSlot();
    return await actionButtonElement.evaluate((element: HTMLButtonElement) => {
      const styles = window.getComputedStyle(element);

      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor,
      };
    });
  }
}

export const mediaControlsFixture = test.extend<{ fixture: TestPage }>({
  fixture: async ({ page }, run) => {
    const fixture = new TestPage(page);
    await fixture.create();
    await run(fixture);
  },
});
