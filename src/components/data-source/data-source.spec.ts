import { expect } from "@playwright/test";
import { dataSourceFixture as test } from "./data-source.fixture";
import { catchLocatorEvent } from "../../tests/helpers";

test.describe("data source", () => {
  test.beforeEach(async ({ fixture }) => {
    await fixture.create();
  });

  [false, true].forEach((localFile: boolean) => {
    const loadFileText = localFile ? "local file" : "remote file";

    test.describe(`loading from a ${loadFileText}`, () => {
      test.beforeEach(async ({ fixture }) => {
        if (localFile) {
          await fixture.setLocalFile();
          return;
        }

        await fixture.setRemoteFile("http://localhost:5173/example.flac");
      });

      test(`should handle removing the source correctly with ${loadFileText}`, () => {});

      test(`should show the correct file name with ${loadFileText}`, () => {});

      test(`should have the correct file type for a jsonfile ${loadFileText}`, () => {});

      test(`should have the correct file type for a csv file ${loadFileText}`, () => {});
    });
  });

  test("should handle having no source correctly with local files", async ({ fixture }) => {
    const expectedLocalFileInputText = "Browse files";
    await fixture.setLocalAttribute(true);
    expect(fixture.filePicker()).toHaveText(expectedLocalFileInputText);
  });

  test("should handle having no source correctly with remote files", async ({ fixture }) => {
    await fixture.setLocalAttribute(false);
    expect(fixture.filePicker()).not.toBeAttached();
  });

  test("should use a custom button for local file inputs", async ({ fixture }) => {
    await fixture.setLocalAttribute(true);
    expect(fixture.browserFileInput()).not.toBeVisible();
  });

  test("should use browser native file input apis for local file inputs", async ({ fixture }) => {
    await fixture.setLocalAttribute(true);
    const fileInputEvent = catchLocatorEvent(fixture.browserFileInput(), "change");
    await fixture.localFileInputButton().click();

    // TODO: Check if we are really expecting a promise rejection here
    expect(fileInputEvent).rejects.toBeTruthy();
  });

  // TODO: this functionality is a stretch goal
  test.fixme("should allow dragging and dropping a file onto local file inputs", () => {});

  test.fixme("should not allow dragging and dropping a file onto local file inputs", () => {});

  test("should handle changing from local to remote files", async ({ fixture }) => {
    await fixture.setLocalAttribute(true);
    expect(fixture.filePicker()).toBeAttached();

    await fixture.setLocalAttribute(false);
    expect(fixture.filePicker()).not.toBeAttached();
  });

  test("should handle changing from remote to local files", async ({ fixture }) => {
    await fixture.setLocalAttribute(false);
    expect(fixture.filePicker()).not.toBeAttached();

    await fixture.setLocalAttribute(true);
    expect(fixture.filePicker()).toBeAttached();
  });

  test("should invalidate local file source when switching to a remote file", () => {});

  test("should invalidate remote source when switching to a local file", () => {});
});
