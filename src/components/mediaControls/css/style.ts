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

  #spectrogram-settings {
    position: relative;
    overflow: hidden;

    .settings-menu {
      display: inline-flex;
    }

    label {
      display: inline-block;
      margin-left: 0.5rem;
    }

    span {
      display: contents;
      vertical-align: top;

      a {
        display: block;
        cursor: pointer;
        margin: 0.5rem;
        /* border-bottom: 2px dotted var(--oe-secondary-color); */
      }
    }
  }

  .content {
    display: block;
    width: fit-content;
  }

  .container {
    display: flex;
    position: relative;
    align-items: center;
    color: var(--oe-font-color);
    width: 100%;
    margin-top: 0.5rem;
    background-color: var(--oe-background-color);
    border-radius: var(--oe-border-rounding);
    box-shadow: var(--oe-box-shadow);
  }
`;
