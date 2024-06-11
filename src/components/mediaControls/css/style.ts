import { css } from "lit";

export const mediaControlsStyles = css`
  :host {
    display: block;
    width: 100%;
  }

  #action-button {
    display: inline;
    cursor: pointer;
    color: black;
    padding: 0.5rem;
    margin-right: inherit;
    box-shadow: none;
  }

  .container {
    display: flex;
    position: relative;
    align-items: center;
    margin-top: var(--oe-spacing);
    color: var(--oe-font-color);
    width: 100%;
    background-color: var(--oe-background-color);
    border-radius: var(--oe-border-rounding);
    box-shadow: var(--oe-box-shadow);
    overflow: hidden;

    /* TODO: remove */
    max-width: 350px;

    font-size: calc(var(--oe-font-size));
  }
`;
