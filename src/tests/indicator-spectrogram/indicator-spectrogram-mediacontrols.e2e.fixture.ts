import { Page } from "@playwright/test";
import { test } from "@sand4rt/experimental-ct-web";
import { setBrowserAttribute } from "../helpers";
import { Spectrogram } from "../../components/spectrogram/spectrogram";

class TestPage {
  public constructor(public readonly page: Page) {}

  public indicatorComponent = () => this.page.locator("oe-indicator").first();
  public indicatorLine = () => this.page.locator("oe-indicator #indicator-line").first();
  public spectrogramComponent = () => this.page.locator("oe-spectrogram").first();
  public mediaControlsActionButton = () => this.page.locator("oe-media-controls #action-button").first();

  public async create() {
    await this.page.setContent(`
      <oe-indicator>
        <oe-spectrogram
          id="spectrogram"
          style="width: 200px; height: 200px;"
          src="http://localhost:3000/example.flac"
        ></oe-spectrogram>
      </oe-indicator>
      <oe-media-controls for="spectrogram"></oe-media-controls>
   `);
    await this.page.waitForLoadState("networkidle");
  }

  public async removeSpectrogramElement() {
    const element = this.spectrogramComponent();
    await element.evaluate((element) => element.remove());
  }

  public async changeSpectrogramAudioSource(newSource: string) {
    const element = this.spectrogramComponent();
    await setBrowserAttribute<Spectrogram>(element, "src", newSource);
  }

  public async indicatorPosition(): Promise<number> {
    return await this.indicatorLine().evaluate((element: SVGLineElement) => {
      const styles = window.getComputedStyle(element);
      const transformX = styles.transform.match(/translateX\(([^)]+)\)/);
      return transformX ? parseFloat(transformX[1]) : 0;
    });
  }

  public async toggleAudio() {
    await this.mediaControlsActionButton().click();
  }

  public async playAudio() {
    await this.toggleAudio();
  }

  public async pauseAudio() {
    await this.toggleAudio();
  }

  public async audioDuration(): Promise<number> {
    return 6_000;
  }
}

export const indicatorSpectrogramMediaControlsFixture = test.extend<{ fixture: TestPage }>({
  fixture: async ({ page }, use) => {
    const fixture = new TestPage(page);
    await fixture.create();
    await use(fixture);
  },
});
