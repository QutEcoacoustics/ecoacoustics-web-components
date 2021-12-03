import {expect, fixture, waitUntil} from '@open-wc/testing';
import {html} from 'lit/static-html.js';
import {createSandbox, SinonSpiedInstance} from 'sinon';
import '../src/oe-media-controls';
import {AudioState, OeMediaControls} from '../src/oe-media-controls.js';
import {fixtureWithContext} from './helpers/fixtureQuery';
import {spyOnLogger} from './helpers/spyOnLogger';

describe('oe-media-controls', () => {
  function getPlayPauseButton(mediaControl: OeMediaControls) {
    return mediaControl.shadowRoot?.querySelector('button');
  }

  function getAudioPlayer(mediaControl: OeMediaControls): HTMLAudioElement {
    return mediaControl.parentNode?.querySelector('audio') as HTMLAudioElement;
  }

  function getError(mediaControl: OeMediaControls): HTMLElement {
    return mediaControl.shadowRoot?.querySelector('.error') as HTMLElement;
  }

  async function waitForMediaUpdate(mediaControls: OeMediaControls, state: AudioState) {
    await waitUntil(
      () => mediaControls.state === state,
      'Media control failed to change its state to ' + AudioState[state],
      // TODO This is a dumb amount of timeout, remove once rxjs import tree shaking is fixed
      {timeout: 60000}
    );
  }

  async function playAudioElement(mediaControls: OeMediaControls, audioElement: HTMLAudioElement) {
    await audioElement.play();
    await waitForMediaUpdate(mediaControls, AudioState.Playing);
  }

  async function pauseAudioElement(mediaControls: OeMediaControls, audioElement: HTMLAudioElement) {
    audioElement.pause();
    await waitForMediaUpdate(mediaControls, AudioState.Paused);
  }

  async function setup(): Promise<OeMediaControls> {
    return fixtureWithContext(
      html`
        <audio id="player" src="dev/sample.wav" controls></audio>
        <oe-media-controls for="player"></oe-media-controls>
      `
    );
  }

  it('is defined', () => {
    const element = document.createElement('oe-media-controls');
    expect(element).to.be.an.instanceOf(OeMediaControls);
  });

  it('passes accessibility test', async () => {
    const el = await setup();
    await expect(el).to.be.accessible();
  });

  it('renders with default values', async () => {
    const mediaControls = await setup();
    expect(mediaControls).shadowDom.equal(
      `
        <div>
          <button disabled="" part="play-pause-button">
            <slot name="play-label">Play</slot>
          </button>
        </div>
      `
    );
  });

  describe('controls with bad "for" attribute', () => {
    const sandbox = createSandbox();
    const missingError = 'oe-media-controls is not linked to an audio element';
    // Need to convert < and > so assertion wont attempt to convert <audio> to an element
    const wrongElementError = 'oe-media-controls is linked to an an element that is not an &lt;audio&gt;';

    function assertError(element: OeMediaControls, _loggerSpy: SinonSpiedInstance<Console>, error: string) {
      const span = getError(element);
      expect(span).dom.equal(`<span class="error" title="${error}">${error}</span>`);
      //loggerSpy.error.calledWith(missingError);
    }

    // TODO Extract this logic to mocha global setup
    afterEach(() => {
      sandbox.restore();
      sandbox.reset();
    });

    it('should error if the for attribute is empty', async () => {
      const {getSpy, tag} = spyOnLogger(OeMediaControls, sandbox);
      const mediaControls = await fixture<OeMediaControls>(html`<${tag} for=""></${tag}>`);
      assertError(mediaControls, getSpy(), missingError);
    });

    it('should error if the for attribute is missing', async () => {
      const {getSpy, tag} = spyOnLogger(OeMediaControls, sandbox);
      const mediaControls = await fixture<OeMediaControls>(html`<${tag}></${tag}>`);
      assertError(mediaControls, getSpy(), missingError);
    });

    it('should error if the for attribute is not a HTMLAudioElement', async () => {
      const {getSpy, tag} = spyOnLogger(OeMediaControls, sandbox);
      const mediaControls = await fixtureWithContext<OeMediaControls>(
        html`
          <img id="player" />
          <${tag} for="player"></${tag}>
        `
      );
      assertError(mediaControls, getSpy(), wrongElementError);
    });
  });

  describe('syncs with audio', () => {
    let audioElement: HTMLAudioElement;
    let mediaControls: OeMediaControls;

    beforeEach(async () => {
      mediaControls = await setup();
      audioElement = getAudioPlayer(mediaControls);
    });

    it('should sync with playing', async () => {
      await playAudioElement(mediaControls, audioElement);
      expect(mediaControls.state).to.eq(AudioState.Playing);
    });

    it('should sync pausing', async () => {
      await pauseAudioElement(mediaControls, audioElement);
      expect(mediaControls.state).to.eq(AudioState.Paused, 'Media controls should show paused');
    });
  });

  describe('attached media element playing', () => {
    let audioElement: HTMLAudioElement;
    let mediaControls: OeMediaControls;

    beforeEach(async () => {
      mediaControls = await setup();
      audioElement = getAudioPlayer(mediaControls);
      await playAudioElement(mediaControls, audioElement);
    });

    it('verifies the state is playing', async () => {
      expect(audioElement.paused).to.be.false;
      expect(mediaControls.state).to.eq(AudioState.Playing);
    });

    it('should show pause label', async () => {
      const button = getPlayPauseButton(mediaControls);
      expect(button).to.have.text('Pause');
    });

    it('pause button should pause media element', async () => {
      const button = getPlayPauseButton(mediaControls);

      expect(audioElement.paused).to.be.false;
      button?.click();

      await waitForMediaUpdate(mediaControls, AudioState.Paused);
      expect(audioElement.paused).to.be.true;
      expect(mediaControls.state).to.eq(AudioState.Paused);
    });

    it('pause button should update label', async () => {
      const button = getPlayPauseButton(mediaControls);
      expect(button).to.have.text('Pause');

      button?.click();
      await waitForMediaUpdate(mediaControls, AudioState.Paused);

      expect(button).to.have.text('Play');
    });
  });

  describe('attached media element paused', () => {
    let audioElement: HTMLAudioElement;
    let mediaControls: OeMediaControls;

    beforeEach(async () => {
      mediaControls = await setup();
      audioElement = getAudioPlayer(mediaControls);
      await pauseAudioElement(mediaControls, audioElement);
    });

    it('verifies the state is paused', async () => {
      expect(audioElement.paused).to.be.true;
      expect(mediaControls.state).to.eq(AudioState.Paused);
    });

    it('should show play label', async () => {
      const button = getPlayPauseButton(mediaControls);
      expect(button).to.have.text('Play');
    });

    it('play button should play media element', async () => {
      const button = getPlayPauseButton(mediaControls);

      expect(audioElement.paused).to.be.true;

      button?.click();
      expect(audioElement.paused).to.be.false;

      expect(mediaControls.state).to.eq(AudioState.Paused);
    });

    it('play button should update label', async () => {
      const button = getPlayPauseButton(mediaControls);

      expect(button).to.have.text('Play');
      button?.click();
      await waitForMediaUpdate(mediaControls, AudioState.Playing);
      expect(button).to.have.text('Pause');
    });
  });

  describe('slots', () => {
    function getPlayLabel(mediaControl: OeMediaControls) {
      return mediaControl.querySelector('[slot="play-label"]');
    }
    function getPauseLabel(mediaControl: OeMediaControls) {
      return mediaControl.querySelector('[slot="pause-label"]');
    }

    it('should show custom play label', async () => {
      const mediaControl = await fixtureWithContext<OeMediaControls>(
        html`
          <audio id="audio" src="dev/sample.wav"></audio>
          <oe-media-controls for="audio">
            <span slot="play-label">yalP</span>
          </oe-media-controls>
        `
      );

      const label = getPlayLabel(mediaControl);
      expect(label).to.have.text('yalP');
    });

    it('should show custom pause label', async () => {
      const mediaControl = await fixtureWithContext<OeMediaControls>(
        html`
          <audio id="audio" src="dev/sample.wav"></audio>
          <oe-media-controls for="audio">
            <span slot="pause-label">esuaP</span>
          </oe-media-controls>
        `
      );

      const label = getPauseLabel(mediaControl);
      expect(label).to.have.text('esuaP');
    });
  });

  describe('parts', () => {
    let controls: OeMediaControls;

    beforeEach(async () => {
      controls = await setup();
    });

    it('has a play pause button part', () => {
      const button = getPlayPauseButton(controls);
      expect(button).to.have.attribute('part', 'play-pause-button');
    });
  });
});
