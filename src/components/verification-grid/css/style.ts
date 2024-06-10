import { css } from "lit";

export const verificationGridStyles = css`
  #highlight-box {
    position: absolute;
    display: none;
    top: 0px;
    left: 0px;
    width: 0px;
    height: 0px;
    position: absolute;
    /* background-color: #00bbff; */
    background-color: #0099ee;
    border: solid 2px #002299;
    border-radius: 1rem;
    opacity: 0.3;
    z-index: 5;
  }

  #help-dialog {
    h1 {
      font-weight: 600;
    }

    h2,
    h3 {
      font-weight: 500;
      margin-bottom: 0;
    }

    hr {
      position: relative;
      margin-top: 1em;
      margin-bottom: 1.5em;
    }

    .dialog-container {
      position: relative;
      margin: 2rem;
    }

    .dialog-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 10%;
    }

    .dialog-controls {
      display: block;
      position: relative;

      .close-btn {
        display: block;
        cursor: pointer;
      }
    }
  }

  .keyboard-shortcuts {
    display: grid;
    position: relative;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    width: 100%;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;

    .row {
      width: 100%;
      .key {
      }

      .description {
        padding-left: 2rem;
      }
    }
  }

  .verification-container {
    background-color: var(--oe-background-color);
    height: 100%;
  }

  .verification-grid {
    user-select: none;
  }

  .verification-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    align-items: stretch;
    gap: 0.5rem;
  }

  .no-items-message {
    font-size: 1.2rem;
  }

  .verification-controls-title {
    text-align: center;
    font-family: sans-serif;
    font-weight: normal;
    font-size: 1.4rem;
    letter-spacing: 0em;
    color: var(--oe-font-color);
  }

  .verification-controls {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;
    padding: 1rem;
    gap: 1rem;
    color: var(--oe-font-color);
  }

  .decision-controls {
    h2 {
      display: block;
    }

    .decision-control-actions {
      display: flex;
    }
  }

  .decision-controls-left,
  .decision-controls-right {
    display: flex;
  }
`;
