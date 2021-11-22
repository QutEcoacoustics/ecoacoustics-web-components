import '../oe-media-controls';
import {OeMediaControls} from '../oe-media-controls.js';
import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';
import {beforeEach} from 'mocha/interfaces/common.js';

suite('oe-media-controls', () => {
  function getMediaControls(rootEl: Element): HTMLElement | null {
    return rootEl.querySelector<HTMLElement>('oe-media-controls');
  }

  function getPlayPauseBtn(mediaControl: HTMLElement) {
    return mediaControl.shadowRoot?.querySelector('button');
  }

  async function setup(): Promise<Element> {
    return await fixture(html`
      <div>
        <audio id="audio" src="dev/sample.wav"></audio>
        <oe-media-controls for="audio"></oe-media-controls>
      </div>
    `);
  }

  test('is defined', () => {
    const el = document.createElement('oe-media-controls');
    assert.instanceOf(el, OeMediaControls);
  });

  test('renders with default values', async () => {
    const el = await setup();
    const mediaControls = getMediaControls(el);
    assert.shadowDom.equal(
      mediaControls,
      `
        <div>
          <button part="play-pause-button">
            <slot name="play-label">Play</slot>
          </button>
        </div>
      `
    );
  });

  test('can play and pause an attached media element', async () => {
    //const el = await fixtureWrapper
    await fixture(html`<audio id="audio" src="dev/sample.wav"></audio>`);
    const el = await fixture(
      html` <oe-media-controls for="audio"></oe-media-controls>`
    );
    assert.shadowDom.equal(
      el,
      `
        <div>
          <button part="play-pause-button">
            <slot name="play-label">Play</slot>
          </button>
        </div>
      `
    );
  });

  suite('attached media element playing', () => {
    test('should show pause label', async () => {});
    test('should show custom pause label', async () => {});
    test('pause button should pause media element', async () => {});
    test('pause button should update label', async () => {});
  });

  suite('attached media element paused', () => {
    let rootEl: Element;
    let mediaControls: HTMLElement;

    beforeEach(async () => {
      rootEl = await setup();
      mediaControls = getMediaControls(rootEl) as HTMLElement;
    });

    test('should show play label', async () => {
      const btn = getPlayPauseBtn(mediaControls);
      console.log(btn);
    });
    test('should show custom play label', async () => {});
    test('play button should play media element', async () => {});
    test('play button should update label', async () => {});
  });

  test('', () => {});
  test('', () => {});
  test('', () => {});
  test('', () => {});
  test('', () => {});
  test('', () => {});
});
