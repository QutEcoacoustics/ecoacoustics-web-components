import { expect } from "@sand4rt/experimental-ct-web";
import { verificationGridFixture as test } from "./verification-grid.fixture";

test.describe("verification grid", () => {
  test.beforeEach(async ({ fixture }) => {
    await fixture.create();
  });

  test("should use the template for each grid item", async ({ fixture }) => {
    const expectedTemplateElements = 3;
    await fixture.setGridSize(expectedTemplateElements);
    const templateElements = await fixture.templateElements();

    expect(templateElements.length).toBe(expectedTemplateElements);
  });
});
