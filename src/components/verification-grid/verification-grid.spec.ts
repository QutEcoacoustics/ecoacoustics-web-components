import { verificationGridFixture as test } from "./verification-grid.fixture";

test.describe("verification grid", () => {
  test.beforeEach(async ({ fixture }) => {
    await fixture.create();
  });
});
