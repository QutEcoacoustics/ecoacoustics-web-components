import { expect } from "@sand4rt/experimental-ct-web";
import { Size } from "../../models/rendering";
import { changeToDesktop, changeToMobile } from "../helpers";
import { verificationGridFixture as test } from "./verification-grid.e2e.fixture";

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

      test("should correctly move all indicators to the start of the recordings", async ({ fixture, page }) => {
        await fixture.playSpectrogram(0);
      });

      test("should reset all media controls to the paused state", () => {});

      test("should stop viewing history when the grid source changes", () => {});
    });
  });

  test.describe("data sources", () => {
    test("should show a local data source in the correct location", () => {});

    test("should not show a remote data source", () => {});
  });

  test.describe("creating decisions", () => {});

  test.describe("downloading verifications", () => {
    test("should not be able to download verifications if no decisions have been made", () => {});

    test("downloading decisions with negative decisions", () => {});
  });

  test.describe("pagination", () => {
    test("should disable the previous button when there are no previous pages", () => {});

    test("should hide the next page button when not viewing history", () => {});

    test("should hide the 'Continue Verifying' button when not viewing history", () => {});

    test("should show the next page button when viewing history", () => {});

    test("should show the 'Continue Verifying' button when viewing history", () => {});

    test("should always show the next page button if auto paging is disabled", () => {});

    test("should not automatically page if auto paging is disabled", () => {});

    test("should automatically page if auto paging is enabled", () => {});
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

    test.describe("explicit tablet selection mode", () => tabletSelectionTests);

    test.describe("default (desktop) selection mode", desktopSelectionTests);

    test.describe("default (mobile) selection mode", tabletSelectionTests);

    test("should select all tiles if ctrl + A is pressed", () => {});

    test("should deselect all tiles if the escape key is pressed", () => {});
  });

  test.describe("highlight selection", () => {
    test("should remove all highlights when the escape key is pressed", () => {});
  });

  test("media control interactions", () => {
    test("should change the spectrogram colours through the media controls should change the grid tile", () => {});

    test("should change the spectrograms axes through the media controls should change the grid tile", () => {});

    test("should remove spectrogram modifications when changing to the next page", () => {});

    test("should show what options are currently selected in the media controls", () => {});
  });

  test("information cards", () => {
    test("should show the information about the current tile", () => {});

    test("should update correctly when paging", () => {});

    test("should update correctly when viewing history", () => {});

    test("should update correctly when changing the grid source", () => {});
  });
});
