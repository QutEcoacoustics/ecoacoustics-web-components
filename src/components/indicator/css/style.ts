import { css } from "lit";

export const indicatorStyles = css`
  #wrapped-element {
    position: relative;
    display: inline-block;
  }

  #wrapped-element > svg {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
    overflow: visible;
  }

  #indicator-line {
    stroke: red;
    stroke-width: 2;
    height: 100%;
  }
`;
