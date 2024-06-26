import { expect } from "@sand4rt/experimental-ct-web";
import { decisionFixture as test } from "./decision.fixture";
import { catchEvent } from "../../tests/helpers";

test.describe("decision", () => {
  test.beforeEach(async ({ fixture }) => {
    await fixture.create();
  });

  test("should show decision highlight color on hover", () => {});

  test("should display a tooltip on hover", () => {});

  test("should show the decision color when the keyboard shortcut is held down", () => {});

  test("should display additional tags when provided", () => {});

  test("should display a keyboard shortcut when provided", () => {});

  test("should display both additional tags and a keyboard shortcut when provided", () => {});

  test("should have a spare space for additional tags even if not provided", () => {});

  test("should have a spare space for a keyboard shortcut if not provided", () => {});

  test("should not show keyboard shortcuts when in tablet selection mode", () => {});

  test("should show the decision color when the mouse is held down", () => {});

  test("should not show the decision color when the mouse is held down if disabled", () => {});

  test("should not show the decision color when the keyboard shortcut is held down if disabled", () => {});

  test.describe("events", () => {
    // we should only see the keyboard shortcut trigger on pointerup
    // this allows the user to cancel the decision with the escape key if they
    // change their mind after clicking
    test("should emit an event when clicked", async ({ fixture, page }) => {
      const decisionEvent = catchEvent(page, "decision");
      await fixture.decisionButton().click();

      const eventResult = await decisionEvent;

      expect(eventResult).toBeTruthy();
    });

    // we should only see the keyboard shortcut trigger on keyup
    test("should emit an event when the keyboard shortcut is pressed", async ({ fixture, page }) => {
      const keyboardShortcut = "a";

      const decisionEvent = catchEvent(page, "decision");
      await fixture.changeKeyboardShortcut(keyboardShortcut);

      await fixture.page.keyboard.press(keyboardShortcut);

      const eventResult = await decisionEvent;

      expect(eventResult).toBeTruthy();
    });

    test("should emit the correct event for a skip decision", async ({ fixture }) => {
      await fixture.changeDecisionType("skip");

      const decisionEvent = catchEvent(fixture.page, "decision");
      await fixture.decisionButton().click();

      const eventResult = await decisionEvent;
      expect(eventResult).toBeTruthy();
    });

    test("should emit the correct event for a unsure decision", async ({ fixture }) => {
      await fixture.changeDecisionType("unsure");
    });

    test("should be able to cancel a pointer decision with the escape key", () => {});

    test("should be able to cancel a keyboard decision with the escape key", () => {});

    test("should not emit an event if disabled", () => {});

    test("should not be clickable if disabled", () => {});

    test("should not be able to make a decision with keyboard shortcuts if disabled", () => {});
  });
});
