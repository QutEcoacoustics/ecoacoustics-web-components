import { css } from "lit";

export const mediaControlsStyles = css`
  :host {
    display: block;
    width: 100%;
  }

  #action-button {
    display: inline-block;
    cursor: pointer;
    color: black;
    padding: 0.5rem;
    margin: 0.5rem;
    margin-right: inherit;
  }

  #spectrogram-settings {
    position: relative;
    display: inline-flex;
    overflow: hidden;

    label {
      display: inline-block;
      margin-left: 0.5rem;
    }

    details {
      display: contents;
      vertical-align: top;

      summary {
        display: block;
        cursor: pointer;
        margin: 0.5rem;
        border-bottom: 2px dotted var(--oe-secondary-color);
      }

      .content {
        display: block;
        position: relative;
      }

      summary::before,
      summary::after {
        content: "";
      }
    }
  }

  .container {
    display: inline-block;
    position: relative;
    color: var(--oe-font-color);
    width: 100%;
    margin-top: 0.5rem;
    background-color: var(--oe-background-color);
    border-radius: var(--oe-border-rounding);
    box-shadow: var(--oe-box-shadow);
  }
`;
