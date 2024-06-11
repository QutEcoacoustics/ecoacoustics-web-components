import { css } from "lit";

export const decisionStyles = css`
  #decision-button {
    --decision-color: var(--oe-primary-color);

    position: relative;
    height: 100%;
    border: 4px solid var(--decision-color);

    & > div {
      display: block;
      min-height: 1em;
    }

    :focus,
    :active {
      outline: none;
      border: none;
    }
  }
`;
