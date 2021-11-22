var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { elementSelector } from './helpers/element-selector';
/**
 * A media control element
 *
 * TODO Full description here
 */
let OeMediaControls = class OeMediaControls extends LitElement {
    constructor() {
        super(...arguments);
        this.for = undefined;
        this.state = 'Play';
    }
    render() {
        return html ` <div>${this.playPauseButton()}</div> `;
    }
    playPauseButton() {
        return html `
      <button part="play-pause-button" @click="${this.clickHandler}">
        ${this.isPlaying()
            ? html `<slot name="play-label">Play</slot>`
            : html `<slot name="pause-label">Pause</slot>`}
      </button>
    `;
    }
    clickHandler() {
        var _a, _b;
        if (this.isPlaying()) {
            (_a = this.for) === null || _a === void 0 ? void 0 : _a.play();
        }
        else {
            (_b = this.for) === null || _b === void 0 ? void 0 : _b.pause();
        }
        this.state = this.isPlaying() ? 'Pause' : 'Play';
    }
    isPlaying() {
        return this.state === 'Play';
    }
};
OeMediaControls.styles = [
    css `
      :host {
        display: block;
        background-color: var(--oe-background-colour, unset);
      }
    `,
];
__decorate([
    property({
        type: HTMLAudioElement,
        converter: elementSelector(),
    })
], OeMediaControls.prototype, "for", void 0);
__decorate([
    state()
], OeMediaControls.prototype, "state", void 0);
OeMediaControls = __decorate([
    customElement('oe-media-controls')
], OeMediaControls);
export { OeMediaControls };
//# sourceMappingURL=oe-media-controls.js.map