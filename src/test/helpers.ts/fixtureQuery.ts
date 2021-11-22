

import { fixture } from "@open-wc/testing";
import { FixtureOptions } from "@open-wc/testing-helpers/types/src/fixture-no-side-effect";
import { LitHTMLRenderable } from "@open-wc/testing-helpers/types/src/litFixture";
import { render, TemplateResult } from "lit";


export async function fixtureWithContext<T extends Element>(context: LitHTMLRenderable, template: LitHTMLRenderable, options?: FixtureOptions) : Promise<T> {
    // create the container
    const parentNode = (options?.parentNode as HTMLElement) ?? document.createElement('div');

    // render the context html
    render(context, parentNode);

    // Render the target custom element through the fixture helper.
    // Invoking fixture is important because it waits for the custom element to finish rendering.

    // TODO: BROKEN - this replaces the content in the parentNode, but it should append to it

    const element = await fixture(template, Object.assign({}, options, { parentNode }));


    // todo: return wrapper element? 
    // todo: return each context after rendering?
    return element as T;
}

// better idea:
// render a multi-element template
// scan through the nodes and wait for each to finish rendering
// and then return the targeted node for the test
// adopt from: https://github.com/open-wc/open-wc/blob/9d275bd3a489d29325ca9f1ea5f887ffb4c1cb08/packages/testing-helpers/src/litFixture.js#L62

export declare const fixtureTarget: (strings: TemplateStringsArray, ...values: unknown[]) => TemplateResult;