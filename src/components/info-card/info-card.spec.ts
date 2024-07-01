import { expect } from "@sand4rt/experimental-ct-web";
import { infoCardFixture as test } from "./info-card.fixture";
import { VerificationSubject } from "../../models/verification";

test.describe("Info Card", () => {
  test.beforeEach(async ({ fixture }) => {
    await fixture.create();
  });

  test("Download link should be the same as the audio source", async ({ fixture }) => {
    const subjectModel: VerificationSubject = {
      name: "John Doe",
      age: 52,
      location: "New York",
      occupation: "Software Engineer",
      company: "Google",
      hobbies: "Fishing",
    };

    await fixture.changeSubject(subjectModel);
  });

  test.fixme("should not have a 'show more' button if there are not more than three subject fields", () => {});

  test.fixme("should not have a 'show more' button if there is no subject", ({ fixture }) => {
    const showMoreButton = fixture.showMoreButton();
    expect(showMoreButton).not.toBeAttached();
  });

  test("The show more and show less button should expand and hide information", async ({ fixture }) => {
    const subjectModel: VerificationSubject = {
      name: "John Doe",
      age: 52,
      location: "New York",
      occupation: "Software Engineer",
      company: "Google",
      hobbies: "Fishing",
    };
    const numberOfCollapsedItems = 3;
    const numberOfExpandedItems = Object.keys(subjectModel).length;

    await fixture.changeSubject(subjectModel);

    const collapsedItem = await fixture.infoCardItems();
    expect(fixture.showMoreButton()).toHaveText("Show More");
    expect(collapsedItem).toHaveLength(numberOfCollapsedItems);

    await fixture.showMoreButton().click();

    const expandedItems = await fixture.infoCardItems();
    expect(fixture.showMoreButton()).toHaveText("Show Less");
    expect(expandedItems).toHaveLength(numberOfExpandedItems);

    await fixture.showMoreButton().click();

    const collapsedItems = await fixture.infoCardItems();
    expect(fixture.showMoreButton()).toHaveText("Show More");
    expect(collapsedItems).toHaveLength(numberOfCollapsedItems);
  });

  test("The info card should show subject information", async ({ fixture }) => {
    const subjectModel: VerificationSubject = {
      name: "John Doe",
      age: 52,
      location: "New York",
      occupation: "Software Engineer",
      company: "Google",
      hobbies: "Fishing",
    };
    const expectedSubjectModel = [
      { key: "name", value: "John Doe" },
      { key: "age", value: "52" },
      { key: "location", value: "New York" },
      { key: "occupation", value: "Software Engineer" },
      { key: "company", value: "Google" },
      { key: "hobbies", value: "Fishing" },
    ];

    await fixture.changeSubject(subjectModel);
    const realizedSubjectModel = await fixture.infoCardItems();

    expect(realizedSubjectModel).toEqual(expectedSubjectModel);
  });

  test("should create the correct info card for a subject with no information", async ({ fixture }) => {
    fixture.changeSubject({});
    const expectedSubjectModel = [];

    const realizedSubjectModel = await fixture.infoCardItems();

    expect(realizedSubjectModel).toEqual(expectedSubjectModel);
  });

  // any undefined values should be filtered out. However, it shouldn't filter
  // out all falsy values. For instance, the number zero is falsy, but should
  // still be shown as a value of zero can still provide useful information
  test("should handle a subject with empty value fields", async ({ fixture }) => {
    const subjectModel: VerificationSubject = {
      name: "",
      age: 0,
      location: undefined,
      occupation: "",
      company: "",
      hobbies: undefined,
    };
    const expectedSubjectModel = [{ key: "age", value: "0" }];

    await fixture.changeSubject(subjectModel);
    const realizedSubjectModel = await fixture.infoCardItems();
    expect(realizedSubjectModel).toEqual(expectedSubjectModel);
  });

  test("should handle changing the value of the subject model", async ({ fixture }) => {
    const subjectModel: VerificationSubject = {
      name: "John Doe",
      age: 52,
      location: "New York",
      occupation: "Software Engineer",
      company: "Google",
      hobbies: "Fishing",
    };
    const newModel: VerificationSubject = {
      age: 53,
      ...subjectModel,
    };
    const expectedSubjectModel = [{ key: "age", value: "53" }];

    await fixture.changeSubject(subjectModel);
    await fixture.changeSubject(newModel);
    const realizedSubjectModel = await fixture.infoCardItems();

    expect(realizedSubjectModel).toEqual(expectedSubjectModel);
  });
});
