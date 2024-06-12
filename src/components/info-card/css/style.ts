import { css } from "lit";

export const infoCardStyle = css`
  .card-container {
    position: relative;
    padding: var(--oe-spacing);
    color: var(--oe-font-color);
    background-color: var(--oe-background-color);
    border-radius: var(--oe-border-rounding);
    font-size: var(--oe-font-size);

    /*
      We multiply the spacing by two here because the spacing
      is applied to both padding left and right
    */
    width: calc(100% - calc(var(--oe-spacing) * 2));
  }

  .subject-row {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 0.5rem;

    .subject-key {
      font-weight: bold;
    }

    .subject-value {
      overflow-wrap: break-word;
      word-break: break-word;
    }
  }

  .static-actions {
    display: flex;
    justify-content: space-between;
  }
`;
