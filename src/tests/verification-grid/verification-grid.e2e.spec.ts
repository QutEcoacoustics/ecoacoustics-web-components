import { verificationGridFixture as test } from "./verification-grid.e2e.fixture";

test.describe("single verification grid", () => {
  test.beforeEach(async ({ fixture }) => {
    await fixture.create();
  });

  test.describe("initial state", () => {
    test("should have the correct grid size", () => {});

    test("should have the correct decisions", () => {});

    test("should not show decision highlights", () => {});
  });

  test.describe("changing attributes", () => {
    test.describe("changing the grid size", () => {
      test("should react correctly to changing the grid size", () => {});

      test("should not use a grid size that is larger than the screen size", () => {});
    });

    test.describe("changing the grid source", () => {
      test("should reset all decision when changing the grid source", () => {});

      test("should remove all sub-selections when changing the grid source", () => {});

      test("should remove all decision button highlights when changing the grid source", () => {});

      test("should remove all tile highlights when changing the grid source", () => {});
    });
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
});
