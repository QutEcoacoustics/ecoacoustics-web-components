import '../oe-media-controls';
import {OeMediaControls} from '../oe-media-controls.js';
import {fixture, assert} from '@open-wc/testing';
import {html, literal} from 'lit/static-html.js';
import { render } from 'lit-html';
import { fixtureWithContext } from './helpers.ts/fixtureQuery';


describe('oe-media-controls', () => {
  function getMediaControls(rootEl: Element): HTMLElement | null {
    return rootEl.querySelector<HTMLElement>('oe-media-controls');
  }

  function getPlayPauseBtn(mediaControl: HTMLElement) {
    return mediaControl.shadowRoot?.querySelector('button');
  }

  async function setup(): Promise<OeMediaControls> {
    return fixtureWithContext(
      `<audio id="audio" src="dev/sample.wav"></audio>`,
      html`<oe-media-controls for="audio"></oe-media-controls>`);
  }

  beforeEach(async () => {
    console.log('beforeEach');
  });

  it('is defined', () => {
    const el = document.createElement('oe-media-controls');
    assert.instanceOf(el, OeMediaControls);
  });

  it('renders with default values', async () => {
    const mediaControls = await setup();
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

  it('renders with default values', async () => {
    const mediaControls = await fixtureWithContext(
      `<audio id="audio" src="dev/sample.wav"></audio>`,
      html`<oe-media-controls for="audio"></oe-media-controls>`);
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


  describe('attached media element playing', () => {
    it('should show pause label', async () => {});
    it('should show custom pause label', async () => {});
    it('pause button should pause media element', async () => {});
    it('pause button should update label', async () => {});
  });

  describe('attached media element paused', () => {
    let audioElement: HTMLAudioElement;
    let mediaControls: HTMLElement;

    beforeEach(async () => {
      mediaControls =  await setup();
      audioElement = mediaControls.parentNode?.querySelector('audio') as HTMLAudioElement;
      audioElement.pause();
    });

    it('verifies the state is paused', async () => {
      assert.isTrue(audioElement.paused);
    });

    it('should show play label', async () => {
      const btn = getPlayPauseBtn(mediaControls);
      console.log(btn);
    });
    it('should show custom play label', async () => {});
    it('play button should play media element', async () => {});
    it('play button should update label', async () => {});
  });

  it('', () => {});
  it('', () => {});
  it('', () => {});
  it('', () => {});
  it('', () => {});
  it('', () => {});
});
