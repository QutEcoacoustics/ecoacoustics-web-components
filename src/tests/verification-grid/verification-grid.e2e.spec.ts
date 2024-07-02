import { expect } from "@sand4rt/experimental-ct-web";
import { Size } from "../../models/rendering";
import { changeToDesktop, changeToMobile } from "../helpers";
import { verificationGridFixture as test } from "./verification-grid.e2e.fixture";
import { sleep } from "../../helpers/utilities";

test.describe("single verification grid", () => {
  test.beforeEach(async ({ fixture }) => {
    await fixture.create();
  });

  test.describe("initial state", () => {
    test("should have the correct grid size", async ({ fixture }) => {
      const expectedGridSize = 8;
      const gridSize = fixture.getGridSize();
      expect(gridSize).toEqual(expectedGridSize);
    });

    test("should have the correct decisions", async ({ fixture }) => {
      const expectedDecisions = ["Positive", "Negative"];
      const decisions = await fixture.availableDecision();
      expect(decisions).toEqual(expectedDecisions);
    });

    test("should not show decision highlights", async ({ fixture }) => {
      const initialDecisionHighlights = await fixture.shownDecisionHighlights();
      expect(initialDecisionHighlights).toHaveLength(0);
    });
  });

  test.describe("changing attributes", () => {
    test.describe("changing the grid size", () => {
      test("should react correctly to changing the grid size", async ({ fixture }) => {
        const expectedGridSize = 1;
        fixture.changeGridSize(expectedGridSize);
        const gridSize = fixture.getGridSize();
        expect(gridSize).toEqual(expectedGridSize);
      });

      test("should not use a grid size that is larger than the screen size", async ({ fixture, page }) => {
        const requestedGridSize = 100;
        const expectedGridSize = 8;

        await changeToDesktop(page);
        fixture.changeGridSize(requestedGridSize);

        const gridSize = fixture.getGridSize();
        expect(gridSize).toEqual(expectedGridSize);
      });

      test("should scale up grid tiles if the grid size doesn't fill up the screen", async ({ fixture }) => {
        await fixture.changeGridSize(1);
        const expectedTileSize: Size = { width: 0, height: 0 };
        const realizedTileSize = (await fixture.tileSizes())[0];
        expect(realizedTileSize).toEqual(expectedTileSize);
      });

      test("should not scale up grid tiles if the grid size fills up the screen", async ({ fixture }) => {
        await fixture.changeGridSize(8);

        const expectedTileSize: Size = { width: 0, height: 0 };
        const realizedTileSize = (await fixture.tileSizes())[0];

        expect(realizedTileSize).toEqual(expectedTileSize);
      });

      test("should decrease the number of grid tiles if the grid size doesn't fit on the screen", () => {});

      test("Should have a 1x1 grid size for mobile devices", async ({ fixture, page }) => {
        await changeToMobile(page);
        const expectedGridSize = 1;
        const realizedGridSize = await fixture.getGridSize();
        expect(realizedGridSize).toEqual(expectedGridSize);
      });
    });

    test.describe("changing the grid source", () => {
      test("should reset all decision when changing the grid source", async ({ fixture }) => {
        const expectedDecisionLength = await fixture.getGridSize();
        await fixture.makeDecision(0);
        expect(fixture.userDecisions()).toHaveLength(expectedDecisionLength);

        await fixture.changeGridSource("http://localhost:3000/gridTiles.json");
        expect(fixture.userDecisions()).toHaveLength(0);
      });

      test("should remove all sub-selections when changing the grid source", async ({ fixture }) => {
        const subSelection = [0, 1];
        await fixture.createSubSelection(subSelection);
        const selectedTiles = await fixture.selectedTiles();
        expect(selectedTiles).toHaveLength(subSelection.length);

        await fixture.changeGridSource("http://localhost:3000/gridTiles.json");
        const newSelectedTiles = await fixture.selectedTiles();
        expect(newSelectedTiles).toHaveLength(0);
      });

      test("should remove all decision button highlights when changing the grid source", async ({ fixture }) => {
        const decision = 0;
        await fixture.makeDecision(decision);
        await fixture.viewPreviousHistoryPage();
        const initialHighlightedDecisions = await fixture.shownDecisionButtonHighlights();
        expect(initialHighlightedDecisions).toBe([decision]);

        await fixture.changeGridSource("http://localhost:3000/gridTiles.json");
        const newHighlightedDecisions = await fixture.shownDecisionButtonHighlights();
        expect(newHighlightedDecisions).toHaveLength(0);
      });

      test("should remove all tile highlights when changing the grid source", async ({ fixture }) => {
        const decision = 0;
        await fixture.makeDecision(decision);
        await fixture.viewPreviousHistoryPage();
        const initialHighlightedDecisions = await fixture.shownDecisionButtonHighlights();
        expect(initialHighlightedDecisions).toBe([decision]);

        await fixture.changeGridSource("http://localhost:3000/gridTiles.json");
        const newHighlightedDecisions = await fixture.shownDecisionButtonHighlights();
        expect(newHighlightedDecisions).toHaveLength(0);
      });

      test("should correctly reset all the information cards", () => {});

      test.fixme("should correctly move all indicators to the start of the recordings", async ({ fixture }) => {
        const targetedTile = 0;
        await fixture.playSpectrogram(targetedTile);

        // TODO: we should use the new Playwright clock API when
        // web-ctx-playwright gets upgraded to version 1.45.0
        // https://playwright.dev/docs/api/class-clock
        sleep(1_000);

        const indicatorPosition = await fixture.indicatorPositions()[targetedTile];
        expect(indicatorPosition).toBe(1_000);

        await fixture.changeGridSource("http://localhost:3000/gridTiles.json");
        const newIndicatorPosition = await fixture.indicatorPositions()[targetedTile];
        expect(newIndicatorPosition).toBe(0);
      });

      test("should reset all media controls to the paused state", async ({ fixture }) => {
        const targetedTile = 0;
        await fixture.playSpectrogram(targetedTile);

        const initialMediaControlsState = await fixture.areMediaControlsPlaying(targetedTile);
        expect(initialMediaControlsState).toBe(true);

        await fixture.changeGridSource("http://localhost:3000/gridTiles.json");

        const stateAfterSourceChange = await fixture.areMediaControlsPlaying(targetedTile);
        expect(stateAfterSourceChange).toBe(false);
      });

      test("should stop viewing history when the grid source changes", () => {});
    });
  });

  test.describe("data sources", () => {
    test("should show a local data source in the correct location", async ({ fixture }) => {
      await fixture.changeSourceLocal(true);
      expect(fixture.fileInputButton()).toBeVisible();
    });

    test("should not show a remote data source", async ({ fixture }) => {
      await fixture.changeSourceLocal(false);
      expect(fixture.fileInputButton()).toBeHidden();
    });
  });

  // TODO: finish off these tests
  test.describe("creating decisions", () => {});

  test.describe("downloading verifications", () => {
    test("should not be able to download verifications if no decisions have been made", async ({ fixture }) => {
      expect(fixture.downloadResultsButton()).toBeDisabled();
    });

    test("should be able to download decisions after a decision is made", async ({ fixture }) => {
      await fixture.makeDecision(0);
      expect(fixture.downloadResultsButton()).toBeEnabled();
    });

    test("should download the correct decisions when viewing history", async ({ fixture }) => {
      // we fill two pages of decisions so that we can go back multiple pages in
      // the history view. This makes sure that when we view items from far
      // back in history, items are not removed from the decisions array
      await fixture.makeDecision(0);
      await fixture.makeDecision(0);
      await fixture.viewPreviousHistoryPage();
      await fixture.viewPreviousHistoryPage();
      await fixture.downloadResults();
    });

    test("should download the correct decisions after changing a decision in history", async ({ fixture }) => {
      await fixture.makeDecision(0);
      await fixture.viewPreviousHistoryPage();
      await fixture.createSubSelection([0]);
      await fixture.makeDecision(1);
    });

    test.fixme("downloading decisions with negative decisions", () => {});
  });

  test.describe("pagination", () => {
    test("should disable the previous button when there are no previous pages", async ({ fixture }) => {
      expect(fixture.previousPageButton()).toBeDisabled();
    });

    test("should disable the previous page button when at the end of history", async ({ fixture }) => {
      await fixture.makeDecision(0);
      await fixture.makeDecision(0);
      expect(fixture.previousPageButton()).toBeEnabled();

      await fixture.viewPreviousHistoryPage();
      expect(fixture.previousPageButton()).toBeEnabled();
      await fixture.viewPreviousHistoryPage();
      expect(fixture.previousPageButton()).toBeDisabled();
    });

    test("should hide the next page button when not viewing history", async ({ fixture }) => {
      expect(fixture.nextPageButton()).not.toBeVisible();
    });

    test("should show the next page button when viewing history", async ({ fixture }) => {
      await fixture.makeDecision(0);
      await fixture.makeDecision(0);
      await fixture.viewPreviousHistoryPage();
      expect(fixture.nextPageButton()).toBeVisible();
    });

    test("should disable the next button when there are no next pages", async ({ fixture }) => {
      await fixture.makeDecision(0);
      await fixture.makeDecision(0);
      await fixture.viewPreviousHistoryPage();
      expect(fixture.nextPageButton()).toBeVisible();
    });

    test("should hide the 'Continue Verifying' button when not viewing history", async ({ fixture }) => {
      expect(fixture.continueVerifyingButton()).not.toBeVisible();
    });

    test("should show the 'Continue Verifying' button when viewing history", async ({ fixture }) => {
      await fixture.makeDecision(0);
      await fixture.viewPreviousHistoryPage();
      expect(fixture.continueVerifyingButton()).toBeVisible();
      expect(fixture.continueVerifyingButton()).toBeEnabled();
    });

    test("should always show the next page button if auto paging is disabled", async ({ fixture }) => {
      await fixture.changeAutoPage(false);
      expect(fixture.nextPageButton()).toBeVisible();
      expect(fixture.nextPageButton()).toBeEnabled();
    });

    test("should automatically page if auto paging is enabled", async ({ fixture }) => {
      const expectedPagedItems = await fixture.getGridSize();
      await fixture.makeDecision(0);
      const pagedItems = await fixture.getPagedItems();
      expect(pagedItems).toEqual(expectedPagedItems);
    });

    test("should not automatically page if auto paging is disabled", async ({ fixture }) => {
      await fixture.changeAutoPage(false);
      await fixture.makeDecision(0);
      const pagedItems = await fixture.getPagedItems();
      expect(pagedItems).toEqual(0);

      const pageSize = await fixture.getGridSize();
      await fixture.nextPage();
      expect(pagedItems).toEqual(pageSize);
    });
  });

  test.describe("sub-selection", () => {
    const desktopSelectionTests = () => {
      test("should select a tile when clicked", () => {});

      test("should de-select other tiles when a tile is selected", () => {});

      test("should add a tile to a selection when the ctrl key is held", () => {});

      test("should deselect other tiles the shift key is held", () => {});

      test("should select one tile if the same tile if shift clicked twice", () => {});

      test("should select a positive direction of tiles when the shift key is held", () => {});

      test("should select a negative direction of tiles when the shift key is held", () => {});

      test("should be able to add positive a range of tiles to a selection if ctrl + shift is held", () => {});

      test("should be able to add negative a range of tiles to a selection if ctrl + shift is held", () => {});
    };

    const tabletSelectionTests = () => {
      test("should select a tile when clicked", () => {});

      test("should de-select other tiles when a tile is selected", () => {});

      test("should add a tile to a selection when the ctrl key is held", () => {});

      test("should deselect other tiles the shift key is held", () => {});

      test("should select one tile if the same tile if shift clicked twice", () => {});

      test("should select a positive direction of tiles when the shift key is held", () => {});

      test("should select a negative direction of tiles when the shift key is held", () => {});

      test("should be able to add positive a range of tiles to a selection if ctrl + shift is held", () => {});

      test("should be able to add negative a range of tiles to a selection if ctrl + shift is held", () => {});
    };

    test.describe("explicit desktop selection mode", desktopSelectionTests);

    test.describe("explicit tablet selection mode", tabletSelectionTests);

    test.describe("default (desktop) selection mode", desktopSelectionTests);

    test.describe("default (mobile) selection mode", tabletSelectionTests);

    test("should select all tiles if ctrl + A is pressed", async ({ fixture, page }) => {
      await page.keyboard.press("Control+A");

      const expectedNumberOfSelected = await fixture.getGridSize();
      const realizedNumberOfSelected = await fixture.selectedTiles();

      expect(realizedNumberOfSelected).toHaveLength(expectedNumberOfSelected);
    });

    test("should deselect all tiles if the escape key is pressed", () => {});
  });

  test.describe("highlight selection", () => {
    test("should remove all highlights when the escape key is pressed", async ({ fixture, page }) => {
      const subSelection = [0, 1, 2, 3];
      await fixture.createSubSelection(subSelection);
      expect(fixture.selectedTiles()).toHaveLength(subSelection.length);

      await page.keyboard.press("Escape");
      expect(fixture.selectedTiles()).toHaveLength(0);
    });
  });

  test.describe("information cards", () => {
    test.beforeEach(async ({ fixture }) => {
      await fixture.changeGridSource("http://localhost:3000/gridTiles.json");
    });

    test("should show the information about the current tile", async ({ fixture }) => {
      const expectedInfoCard = [
        { key: "Title 1", value: "Description 1" },
        { key: "Title 2", value: "Description 2" },
      ];

      const realizedInfoCard = await fixture.infoCardItem(0);
      expect(realizedInfoCard).toEqual(expectedInfoCard);
    });

    test("should update correctly when paging", async ({ fixture }) => {
      await fixture.makeDecision(0);

      const expectedInfoCard = [
        { key: "Title 1", value: "Description 1" },
        { key: "Title 2", value: "Description 2" },
      ];
      const realizedInfoCard = await fixture.infoCardItem(0);
      expect(realizedInfoCard).toEqual(expectedInfoCard);
    });

    test("should update correctly when viewing history", async ({ fixture }) => {
      await fixture.makeDecision(0);
      await fixture.viewPreviousHistoryPage();

      const expectedInfoCard = [
        { key: "Title 1", value: "Description 1" },
        { key: "Title 2", value: "Description 2" },
      ];
      const realizedInfoCard = await fixture.infoCardItem(0);
      expect(realizedInfoCard).toEqual(expectedInfoCard);
    });

    test("should update correctly when changing the grid source", async ({ fixture }) => {
      const expectedInitialInfoCard = [
        { key: "Title 1", value: "Description 1" },
        { key: "Title 2", value: "Description 2" },
      ];
      const expectedNewInfoCard = [
        { key: "Title 3", value: "Description 3" },
        { key: "Title 4", value: "Description 4" },
      ];

      await fixture.changeGridSource("http://localhost:3000/gridTiles.json");

      const realizedInitialInfoCard = await fixture.infoCardItem(0);
      expect(realizedInitialInfoCard).toEqual(expectedInitialInfoCard);

      await fixture.changeGridSource("http://localhost:3000/gridTiles.json");
      const realizedNewInfoCard = await fixture.infoCardItem(0);
      expect(realizedNewInfoCard).toEqual(expectedNewInfoCard);
    });
  });
});
