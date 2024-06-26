import { setBrowserAttribute } from "../helpers";
import { Spectrogram } from "../../components/spectrogram/spectrogram";
import { test } from "@sand4rt/experimental-ct-web";
import { Page } from "@playwright/test";
import { Size } from "../../models/rendering";

class TestPage {
  public constructor(public readonly page: Page) {}

  public axesComponent = () => this.page.locator("oe-axes").first();
  public spectrogramComponent = () => this.page.locator("oe-spectrogram").first();
  public xAxisTicks = () => this.page.locator("[part='x-tick']").all();
  public yAxisTicks = () => this.page.locator("[part='y-tick']").all();
  public xAxisLabels = () => this.page.locator("[part='x-label']").all();
  public yAxisLabels = () => this.page.locator("[part='y-label']").all();
  public xGridLines = () => this.page.locator("[part='x-grid'] line").all();
  public yGridLines = () => this.page.locator("[part='y-grid'] line").all();
  private audioSource = "http://localhost:3000/example.flac";

  // render window should be in the format x0, y0, x1, y1
  public async create(offset?: number, renderWindow?: string) {
    await this.page.setContent(`
      <oe-axes>
        <oe-spectrogram
          id="spectrogram"
          src="${this.audioSource}"
          ${offset ? `offset="${offset}"` : ""}
          ${renderWindow ? `window="${renderWindow}"` : ""}
        ></oe-spectrogram>
      </oe-axes>
    `);
    await this.page.waitForLoadState("networkidle");
  }

  public async changeSize(size: Size) {
    await this.spectrogramComponent().evaluate((element, size) => {
      element.style.width = `${size.width}px`;
      element.style.height = `${size.height}px`;
    }, size);
  }

  public async spectrogramSize(): Promise<Size> {
    return await this.spectrogramComponent().evaluate((element) => {
      const { width, height } = element.getBoundingClientRect();
      return { width, height };
    });
  }

  public async changeSpectrogramSrc(src: string) {
    await setBrowserAttribute<Spectrogram>(this.spectrogramComponent(), "src", src);
  }

  public async xAxisStep(): Promise<number> {
    const lastValue = await (await this.xAxisLabels()).at(-1)?.textContent();
    const secondLastValue = await (await this.xAxisLabels()).at(-2)?.textContent();
    const step = Number(lastValue) - Number(secondLastValue);
    return Math.abs(step);
  }

  public async yAxisStep(): Promise<number> {
    const lastValue = await (await this.yAxisLabels()).at(-1)?.textContent();
    const secondLastValue = await (await this.yAxisLabels()).at(-2)?.textContent();
    const step = Number(lastValue) - Number(secondLastValue);
    return Math.abs(step);
  }

  public async xTicksCount(): Promise<number> {
    const ticks = await this.xAxisTicks();
    return ticks.length;
  }
}

export const axesSpectrogramFixture = test.extend<{ fixture: TestPage }>({
  fixture: async ({ page }, run) => {
    const fixture = new TestPage(page);
    await fixture.create();
    await run(fixture);
  },
});
