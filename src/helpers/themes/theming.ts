import { css } from "lit";

export const theming = css`
  /* TODO: we probably only need :host here */
  :host,
  :root {
    --oe-theme-hue: 247deg;
    --oe-theme-saturation: 27%;
    --oe-theme-lightness: 95%;

    --oe-background-color: hsl(var(--oe-theme-hue), var(--oe-theme-saturation), calc(var(--oe-theme-lightness) + 22%));
    --oe-font-color: hsl(
      var(--oe-theme-hue),
      calc(var(--oe-theme-saturation) - 50%),
      calc(var(--oe-theme-lightness) - 90%)
    );

    --oe-border-rounding: 6px;
    --oe-border-color: hsl(var(--oe-theme-hue), var(--oe-theme-saturation), calc(var(--oe-theme-lightness) - 10%));
    --oe-font-family: sans-serif;
    --oe-box-shadow: 1px 1px 1px currentcolor;

    --oe-primary-color: hsl(var(--oe-theme-hue), var(--oe-theme-saturation), calc(var(--oe-theme-lightness) - 38%));
    --oe-secondary-color: hsl(var(--oe-theme-hue), var(--oe-theme-saturation), calc(var(--oe-theme-lightness) - 10%));
    --oe-accent-color: hsl(var(--oe-theme-hue), var(--oe-theme-saturation), calc(var(--oe-theme-lightness) - 20%));
    --oe-info-color: hsl(207deg, var(--oe-theme-saturation), calc(var(--oe-theme-lightness) - 15%));
    /* --oe-danger-color: hsl(0deg, 90%, 61%); */
    --oe-danger-color: color-mix(in srgb, hsl(0deg, 90%, 61%) 75%, var(--oe-background-color));
    --oe-selected-color: hsl(var(--oe-theme-hue), var(--oe-theme-saturation), calc(var(--oe-theme-lightness) - 5%));
    --oe-panel-color: hsl(var(--oe-theme-hue), var(--oe-theme-saturation), calc(var(--oe-theme-lightness) + 2%));

    --oe-panel-color-lighter: color-mix(in srgb, var(--oe-panel-color) 1%, var(--oe-background-color));
  }

  * {
    font-family: var(--oe-font-family);
  }

  button:disabled,
  input:disabled {
    filter: grayscale(100%);
    opacity: 0.5;
    cursor: not-allowed;
  }

  kbd {
    position: relative;
    display: inline-block;
    color: var(--oe-font-color);
    font-family: "Courier New", Courier, monospace;
    text-align: center;
    font-weight: bold;
    padding: 0.2rem;
    padding-left: 0.5em;
    padding-right: 0.5em;
    z-index: 0;
    margin-top: 0.2rem;
    margin: 0.5rem;
    width: max-content;

    &::before {
      content: "";
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
      border-radius: 0.13em;
      background: radial-gradient(circle farthest-corner at top right, #ededed, #c8c8c8);
      box-shadow: 0px 0px 0.13em 0.1em rgba(0, 0, 0, 0.2);
      z-index: -1;
    }

    &::after {
      content: "";
      position: absolute;
      top: -0.065em;
      left: -0.065em;
      width: 100%;
      height: 100%;
      padding: 0.13em;
      border-radius: 0.15em;
      background: radial-gradient(circle farthest-corner at bottom right, #cacaca, #cacaca);
      box-shadow: 0.065em 0.065em 0.13em 0.13em rgba(0, 0, 0, 0.5);
      z-index: -2;
    }
  }

  a {
    text-decoration: underline;
    color: var(--oe-font-color);

    &:hover {
      text-decoration: none;
    }

    &:visited {
    }
  }

  hr {
    border: 0;
    height: 1px;
    background-color: var(--oe-font-color);
    opacity: 0.2;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
  }

  dialog {
  }

  input:not([type="checkbox"], [type="radio"]),
  textarea,
  select {
    box-shadow: 0 0 0 1px var(--oe-secondary-color);

    &:focus {
      box-shadow: 0 0 0 2px var(--oe-selected-color);
    }
  }

  input,
  textarea,
  select {
    font-size: 1rem;
    padding: 0.56em;
    padding-left: 1em;
    border: none;
    border-radius: var(--oe-border-rounding);
    background-color: var(--oe-panel-color-lighter);
    color: var(--oe-font-color);

    &:focus {
      outline: none;
      border-color: var(--oe-selected-color);
      background-color: var(--oe-background-color);
    }
  }

  input[type="number"] {
    -moz-appearance: textfield;
    -webkit-appearance: none;
    appearance: textfield;
  }

  input[type="checkbox"],
  input[type="radio"] {
    position: relative;
    accent-color: var(--oe-primary-color);
    width: 1.2rem;
    height: 1.2rem;
  }

  label:has(> input[type="checkbox"], > input[type="radio"]) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 0.5rem;
  }

  input[type="file"] {
    position: relative;
    padding: 0.5rem;
    border: none;

    &::file-selector-button {
      border: none;
      border-radius: var(--oe-border-rounding);
      color: var(--oe-font-color);
      font-weight: bold;
      background-color: var(--oe-panel-color);
      padding: 0.5rem;
    }
  }

  /*
    Ripple effect is modified from a CSS-Tricks article
    https://css-tricks.com/how-to-recreate-the-ripple-effect-of-material-design-buttons/#aa-css-only
  */
  button {
    --background-color: var(--oe-panel-color);
    --ripple-color: color-mix(in srgb, var(--background-color) 90%, black);

    border: none;
    border-radius: var(--oe-border-rounding);
    margin: 0.1rem;
    font-size: 0.9rem;
    max-width: max-content;
    padding: 1em;
    padding-left: 2rem;
    padding-right: 2rem;
    background-color: var(--background-color);
    transition: background 0.3s;

    /*
      Box shadows make a button look raised and clickable.
      Therefore, if the button is disabled, we do not want to show the box shadow.
    */
    &:not(:disabled) {
      box-shadow: var(--oe-box-shadow);
    }

    &:hover:not(:disabled) {
      background: var(--background-color) radial-gradient(circle, transparent 1%, var(--background-color) 1%)
        center/15000%;
      cursor: pointer;
    }

    &:active:not(:disabled) {
      background-color: var(--ripple-color);
      background-size: 100%;
      transition: background 0s;
    }
  }

  .hidden {
    display: none;
  }

  .oe-btn-primary {
    --background-color: var(--oe-background-color);
    border: 2px solid var(--oe-primary-color);
  }

  .oe-btn-secondary {
    --background-color: var(--oe-secondary-color);
  }

  .oe-btn-info {
    --background-color: var(--oe-info-color);
  }

  .oe-btn-danger {
    --background-color: var(--oe-danger-color);
    color: white;
  }
`;
