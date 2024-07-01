import { Locator, Page } from "@playwright/test";
import { test } from "@sand4rt/experimental-ct-web";
import { getBrowserValue, setBrowserAttribute } from "../helpers";
import { VerificationGrid } from "../../components/verification-grid/verification-grid";
import { Size } from "../../models/rendering";
import { DataSource, Indicator, VerificationGridTile } from "../../components";
import { Verification } from "../../models/verification";

class TestPage {
  public constructor(public readonly page: Page) {}

  public gridComponent = () => this.page.locator("oe-verification-grid").first();
  public dataSourceComponent = () => this.page.locator("oe-data-source").first();
  public mediaControlsComponent = () => this.page.locator("oe-media-controls").first();
  public gridTileComponents = () => this.page.locator("oe-verification-grid-tile").all();
  public indicatorComponents = () => this.page.locator("oe-indicator").all();

  public mediaControlsActionButton = () => this.mediaControlsComponent().locator("#action-button").first();
  public decisionButtons = () => this.page.locator("oe-decision").all();
  public helpDialog = () => this.page.locator("oe-help-dialog").first();
  public openHelpDialogButton = () => this.page.locator("oe-help-button").first();
  public fileInputButton = () => this.page.locator(".file-input").first();
  public helpDialogButton = () => this.page.getByTestId("help-dialog-button");
  public nextPageButton = () => this.page.getByTestId("next-page-button");
  public continueVerifyingButton = () => this.page.getByTestId("continue-verifying-button");
  public previousPageButton = () => this.page.getByTestId("previous-page-button");
  public downloadResultsButton = () => this.page.getByTestId("download-results-button");

  public async create() {
    await this.page.setContent(`
      <oe-verification-grid id="verification-grid">
        <template>
            <oe-axes>
                <oe-indicator>
                    <oe-spectrogram id="spectrogram" color-map="audacity"></oe-spectrogram>
                </oe-indicator>
            </oe-axes>
            <oe-media-controls for="spectrogram"></oe-media-controls>
            <oe-info-card></oe-info-card>
        </template>

        <oe-decision verified="true" tag="koala" shortcut="Y">Koala</oe-decision>
        <oe-decision verified="false" tag="koala" shortcut="N">Not Koala</oe-decision>

        <oe-data-source
          slot="data-source"
          for="verification-grid"
          src="http://localhost:3000/grid-items.csv"
          local
        ></oe-data-source>
      </oe-verification-grid>
    `);
    await this.page.waitForLoadState("networkidle");
  }

  // getters
  public async getGridSize(): Promise<number> {
    const gridTiles = await this.gridTileComponents();
    return gridTiles.length;
  }

  public async tileSizes(): Promise<Size[]> {
    const gridTiles = await this.gridTileComponents();

    const sizes: Size[] = [];

    for (const tile of gridTiles) {
      const styles: any = await getBrowserValue<VerificationGridTile>(tile, "style");
      const width = styles.width;
      const height = styles.height;

      sizes.push({ width, height });
    }

    return sizes;
  }

  public async selectedTiles(): Promise<Locator[]> {
    const gridTiles = await this.gridTileComponents();

    const tiles: Locator[] = [];

    for (const tile of gridTiles) {
      const selected = await getBrowserValue<VerificationGridTile>(tile, "selected");
      if (selected) {
        tiles.push(tile);
      }
    }

    return tiles;
  }

  public async availableDecision(): Promise<string[]> {
    return [];
  }

  public async shownDecisionHighlights(): Promise<string[]> {
    return [];
  }

  public async shownDecisionButtonHighlights(): Promise<string[]> {
    return [];
  }

  public async areMediaControlsPlaying(): Promise<boolean> {
    const mediaControlsPlayButton = this.mediaControlsComponent().locator("[part='play-icon']").first();
    return mediaControlsPlayButton.isVisible();
  }

  public async indicatorPositions(): Promise<number[]> {
    const positions: number[] = [];
    const indicatorComponents = await this.indicatorComponents();

    for (const indicator of indicatorComponents) {
      const position = (await getBrowserValue<Indicator>(indicator, "xPos")) as number;
      positions.push(position);
    }

    return positions;
  }

  // actions
  public async nextPage() {
    await this.nextPageButton().click();
  }

  public async playSpectrogram(index: number) {
    const gridTiles = await this.gridTileComponents();
    const playButton = gridTiles[index].locator("").first();
    await playButton.click();
  }

  public async openHelpDialog() {
    await this.openHelpDialogButton().click();
  }

  public async createSubSelection(items: number[]) {
    const gridTiles = await this.gridTileComponents();

    for (const index of items) {
      await gridTiles[index].click();
    }
  }

  public async makeDecision(decision: number) {
    const decisionButtons = await this.decisionButtons();
    await decisionButtons[decision].click();
  }

  public async viewPreviousHistoryPage() {
    await this.previousPageButton().click();
  }

  public async viewNextHistoryPage() {
    await this.nextPageButton().click();
  }

  public async continueVerifying() {
    await this.continueVerifyingButton().click();
  }

  public async downloadResults() {
    await this.downloadResultsButton().click();
  }

  public async selectFile() {
    await this.fileInputButton().setInputFiles("file.json");
  }

  public async userDecisions(): Promise<Verification[]> {
    return (await getBrowserValue<VerificationGrid>(this.gridComponent(), "decisions")) as Verification[];
  }

  // change attributes
  public async changeGridSize(value: number) {
    await setBrowserAttribute<VerificationGrid>(this.gridComponent(), "grid-size" as any, value.toString());
  }

  public async changeGridSource(value: string) {
    await setBrowserAttribute<DataSource>(this.dataSourceComponent(), "src", value);
  }

  public async changeGridKey(value: string) {
    await setBrowserAttribute<VerificationGrid>(this.gridComponent(), "audioKey", value);
  }

  public async changeAutoPage(value: boolean) {
    await setBrowserAttribute<VerificationGrid>(this.gridComponent(), "autoPage", value.toString());
  }
}

export const verificationGridFixture = test.extend<{ fixture: TestPage }>({
  fixture: async ({ page }, run) => {
    const fixture = new TestPage(page);
    await fixture.create();
    await run(fixture);
  },
});
