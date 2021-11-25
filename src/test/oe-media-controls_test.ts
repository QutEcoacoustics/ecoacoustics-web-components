import {expect, fixture} from '@open-wc/testing';
import {html} from 'lit/static-html.js';
import '../oe-media-controls';
import {AudioState, OeMediaControls} from '../oe-media-controls.js';
import {fixtureWithContext} from './helpers/fixtureQuery';
import {spyOnLogger} from './helpers/spyOnLogger';

describe('oe-media-controls', () => {
  function getPlayPauseButton(mediaControl: OeMediaControls) {
    return mediaControl.shadowRoot?.querySelector('button');
  }

  function getAudioPlayer(mediaControl: OeMediaControls): HTMLAudioElement {
    return mediaControl.parentNode?.querySelector('audio') as HTMLAudioElement;
  }

  async function setup(): Promise<OeMediaControls> {
    return fixtureWithContext(
      html`
        <audio id="audio" src="dev/sample.wav" controls></audio>
        <oe-media-controls for="audio"></oe-media-controls>
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

  xdescribe('controls with bad "for" attribute', () => {
    const missingError = 'oe-media-controls is not linked to an audio element';
    const wrongElementError = 'oe-media-controls is not linked to an an element that is not an <audio>';

    it('should error if the for attribute is empty', async () => {
      const {getSpy, tag} = spyOnLogger(OeMediaControls);

      const element = await fixture(html`<${tag} for=""></${tag}>`);
      const span = element.shadowRoot?.querySelector('.error');
      expect(span).dom.equal(
        `
        <span class="error" title="${missingError}"
        </span>
        `
      );
      getSpy().error.calledWith(missingError);
    });

    it('should error if the for attribute is missing', async () => {
      const {getSpy, tag} = spyOnLogger(OeMediaControls);

      const element = await fixture(html`<${tag}></${tag}>`);
      const span = element.shadowRoot?.querySelector('.error');
      expect(span).dom.equal(
        `
        <span class="error" title="${missingError}"
        </span>
        `
      );
      getSpy().error.calledWith(missingError);
    });

    it('should error if the for attribute is not a HTMLAudioElement', async () => {
      const {getSpy, tag} = spyOnLogger(OeMediaControls);

      const element = await fixture(html`<img id="image" /><${tag} for="image"></${tag}>`);
      const span = element.shadowRoot?.querySelector('.error');
      expect(span).dom.equal(
        `
        <span class="error" title="${wrongElementError}"
        </span>
        `
      );
      getSpy().error.calledWith(wrongElementError);
    });
  });

  xdescribe('syncs with audio', () => {
    let audioElement: HTMLAudioElement;
    let mediaControls: OeMediaControls;

    beforeEach(async () => {
      mediaControls = await setup();
      audioElement = getAudioPlayer(mediaControls);
    });

    it('should sync pausing', async () => {
      audioElement.pause();
      expect(mediaControls.state).to.eq(AudioState.Paused);

      audioElement.play();
      expect(mediaControls.state).to.eq(AudioState.Playing);
    });
  });

  xdescribe('attached media element playing', () => {
    let audioElement: HTMLAudioElement;
    let mediaControls: OeMediaControls;

    beforeEach(async () => {
      mediaControls = await setup();
      audioElement = getAudioPlayer(mediaControls);
      mediaControls.play();
    });

    it('verifies the state is paused', async () => {
      expect(audioElement.paused).to.be.false('should be playing');
      expect(mediaControls.state).to.eq(AudioState.Playing);
    });

    it('should show pause label', async () => {
      const button = getPlayPauseButton(mediaControls);

      expect(button).to.have.text('Pause');
    });

    it('pause button should pause media element', async () => {
      const button = getPlayPauseButton(mediaControls);

      expect(audioElement.paused).to.be.false('should be playing');
      button?.click();
      expect(audioElement.paused).to.be.true('should be paused');
      expect(mediaControls.state).to.eq(AudioState.Playing);
    });

    it('pause button should update label', async () => {
      const button = getPlayPauseButton(mediaControls);

      expect(button).to.have.text('Pause');
      button?.click();
      expect(button).to.have.text('Play');
    });
  });

  xdescribe('attached media element paused', () => {
    let audioElement: HTMLAudioElement;
    let mediaControls: OeMediaControls;

    beforeEach(async () => {
      mediaControls = await setup();
      audioElement = getAudioPlayer(mediaControls);
      mediaControls.pause();
    });

    it('verifies the state is paused', async () => {
      expect(audioElement.paused).to.be.true('should be paused');
      expect(mediaControls.state).to.eq(AudioState.Paused);
    });

    it('should show play label', async () => {
      const button = getPlayPauseButton(mediaControls);

      expect(button).to.have.text('Play');
    });

    it('play button should play media element', async () => {
      const button = getPlayPauseButton(mediaControls);

      expect(audioElement.paused).to.be.true('should be paused');

      button?.click();
      expect(audioElement.paused).to.be.false('should be playing');

      expect(mediaControls.state).to.eq(AudioState.Paused);
    });
    it('play button should update label', async () => {
      const button = getPlayPauseButton(mediaControls);

      expect(button).to.have.text('Play');
      button?.click();
      expect(button).to.have.text('Pause');
    });
  });

  xdescribe('slots', () => {
    it('should show custom play label', async () => {
      const fixture = await fixtureWithContext<OeMediaControls>(
        html`
          <audio id="audio" src="dev/sample.wav"></audio>
          <oe-media-controls for="audio">
            <slot name="play-label">yalP</slot>
          </oe-media-controls>
        `
      );

      const button = getPlayPauseButton(fixture);
      expect(button).to.have.text('yalP');
    });

    it('should show custom pause label', async () => {
      const fixture = await fixtureWithContext<OeMediaControls>(
        html`
          <audio id="audio" src="dev/sample.wav"></audio>
          <oe-media-controls for="audio">
            <slot name="pause-label">esuaP</slot>
          </oe-media-controls>
        `
      );

      const button = getPlayPauseButton(fixture);
      expect(button).to.have.text('esuaP');
    });
  });

  xdescribe('parts', () => {
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
