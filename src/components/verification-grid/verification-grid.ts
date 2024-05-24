import { customElement, property, queryAll, state } from "lit/decorators.js";
import { AbstractComponent } from "../../mixins/abstractComponent";
import { html, LitElement, PropertyValueMap, TemplateResult } from "lit";
import { verificationGridStyles } from "./css/style";
import { Spectrogram } from "../spectrogram/spectrogram";
import { queryDeeplyAssignedElements } from "../../helpers/decorators";
import { Verification } from "../../models/verification";
import { VerificationGridTile } from "../../../playwright";

type PageFetcher = (elapsedItems: number) => Promise<any[]>;

/**
 * A verification grid component that can be used to validate and verify audio events
 *
 * @example
 * ```html
 * <oe-verification-grid src="grid-items.json" gridSize="10">
 *   <oe-spectrogram slot="spectrogram"></oe-spectrogram>
 * </oe-verification-grid>
 * ```
 *
 * @property src - The source of the grid items
 * @property get-page - A callback function that returns a page from a page number
 * @property grid-size - The number of items to display in a single grid
 * @property key - An object key to use as the audio source
 *
 * @csspart sub-selection-checkbox - A css target for the sub-selection checkbox
 *
 * @slot - A template to display the audio event to be verified
 */
//! Please don't look at this component yet until it is finalized, it has a lot of bad code
@customElement("oe-verification-grid")
export class VerificationGrid extends AbstractComponent(LitElement) {
  public static styles = verificationGridStyles;

  @property({ attribute: "grid-size", type: Number, reflect: true })
  public gridSize = 8;

  // we use pagedItems instead of page here so that if the grid size changes
  // half way through, we can continue verifying from where it left off
  @property({ attribute: "paged-items", type: Number, reflect: true })
  private pagedItems = 0;

  @property({ type: String })
  public src: string | undefined;

  // TODO: we probably won't need this when we create a formal spec for the
  // expected data structure
  @property({ type: String })
  public key!: string;

  @property({ attribute: "get-page", type: String })
  public getPage!: PageFetcher;

  @queryDeeplyAssignedElements({ selector: "template" })
  public gridItemTemplate!: HTMLTemplateElement;

  @queryAll("oe-verification-grid-tile")
  public gridTiles: NodeListOf<VerificationGridTile> | undefined;

  @state()
  private spectrogramElements: TemplateResult<1> | TemplateResult<1>[] | undefined;

  private intersectionHandler = this.handleIntersection.bind(this);
  private intersectionObserver = new IntersectionObserver(this.intersectionHandler);

  // stores where the component thinks the server has recalled / cached up to
  private serverCacheHead = this.gridSize;
  private serverCacheExhausted = false;

  public disconnectedCallback(): void {
    this.intersectionObserver.disconnect();
  }

  protected updated(): void {
    const elementsToObserve = this.gridTiles;

    if (!elementsToObserve) {
      throw new Error("Fatal error: No grid tiles found");
    }

    for (const element of elementsToObserve) {
      this.intersectionObserver.observe(element);
    }
  }

  protected willUpdate(changedProperties: PropertyValueMap<this>): void {
    const reRenderKeys: (keyof this)[] = ["gridSize", "key"];
    const sourceInvalidationKeys: (keyof this)[] = ["getPage", "src"];

    // TODO: figure out if there is a better way to do this invalidation
    if (sourceInvalidationKeys.some((key) => changedProperties.has(key))) {
      if (!this.getPage) {
        if (!this.src) {
          throw new Error("getPage or src is required for verification-grid");
        }

        this.getPage = this.srcPageCallback(this.src);
      }

      this.pagedItems = 0;

      if (this.gridTiles?.length) {
        this.renderVirtualPage();
      }
    }

    if (reRenderKeys.some((key) => changedProperties.has(key))) {
      this.createSpectrogramElements();
      this.cacheNext();
    }
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      if (entry.intersectionRatio < 1) {
        // this.gridSize--;
      }
    }
  }

  // this function can be used in a map function over the getPage results to convert
  // OE Verification data model
  private convertJsonToVerification(original: Record<string, any>): Verification {
    const possibleSrcKeys = ["src", "url"];
    const possibleTagKeys = ["tag", "tags"];
    const possibleSubjectKeys = ["subject", "context"];

    this.key ??= possibleSrcKeys.find((key) => key in original) ?? "";
    const tag = possibleTagKeys.find((key) => key in original) ?? "";
    const subject = possibleSubjectKeys.find((key) => key in original) ?? "";

    return new Verification({
      subject: original[subject],
      url: original[this.key],
      tag: { id: 0, text: original[tag] },
      confirmed: false,
      additionalTags: [],
    });
  }

  private srcPageCallback(src: string): PageFetcher {
    return async (elapsedItems: number) => {
      const response = await fetch(src);
      const data = await response.json();

      const startIndex = elapsedItems;
      const endIndex = startIndex + this.gridSize;

      return data.slice(startIndex, endIndex) ?? [];
    };
  }

  private catchDecision(event: CustomEvent) {
    const decision: string[] = event.detail.value;

    // TODO: Fix this
    const gridTiles = Array.from(this.gridTiles ?? []);
    const subSelection = gridTiles.filter((tile) => tile.selected);
    const hasSubSelection = subSelection.length > 0;

    const value: (Verification | undefined)[] = hasSubSelection
      ? subSelection.map((tile) => tile.model)
      : gridTiles.map((tile) => tile.model);

    this.dispatchEvent(
      new CustomEvent("decision-made", {
        detail: {
          decision,
          value,
        },
      }),
    );

    this.removeSubSelection();

    this.pagedItems += this.gridSize;
    this.renderVirtualPage();
  }

  private removeSubSelection(): void {
    const elements = this.gridTiles;

    if (!elements) {
      throw new Error("Fatal error: No grid tiles found");
    }

    for (const element of elements) {
      element.selected = false;
    }
  }

  private async renderVirtualPage(): Promise<void> {
    this.removeSubSelection();

    const elements = this.gridTiles;

    //? HN asking AT: `!elements?.length` or `elements === undefined || elements.length === 0`
    if (elements === undefined || elements.length === 0) {
      throw new Error("Could not find instantiated spectrogram elements");
    }

    let nextPage = await this.getPage(this.pagedItems);

    if (nextPage.length === 0) {
      this.spectrogramElements = this.noItemsTemplate();
    }

    nextPage = nextPage.map((item) => this.convertJsonToVerification(item));

    nextPage.forEach((item: Verification, i: number) => {
      const target = elements[i];

      target.model = item;
      target.index = i;
    });

    // if we are on the last page, we hide the remaining elements
    const pagedDelta = elements.length - nextPage.length;
    this.gridSize -= pagedDelta;

    this.cacheNext();
  }

  private async cacheClient(elapsedItems: number) {
    let page = await this.getPage(elapsedItems);

    if (page.length === 0) {
      return;
    }

    page = page.map((item) => this.convertJsonToVerification(item));

    await Promise.all(page.map((item) => fetch(item.url, { method: "GET" })));
  }

  private async cacheServer(targetElapsedItems: number) {
    while (this.serverCacheHead < targetElapsedItems) {
      let page = await this.getPage(this.serverCacheHead);

      if (page.length === 0) {
        this.serverCacheExhausted = true;
        return;
      }

      page = page.map((item) => this.convertJsonToVerification(item));

      Promise.all(page.map((item) => fetch(item.url, { method: "HEAD" })));

      this.serverCacheHead += page.length;
    }
  }

  private cacheNext() {
    // start caching client side from the start of the next page
    const pagesToClientCache = this.pagedItems + this.gridSize;

    const PagesToCacheServerSide = 10;
    // prettier-ignore
    const targetServerCacheHead = pagesToClientCache + (this.gridSize * PagesToCacheServerSide);

    this.cacheClient(pagesToClientCache);

    if (!this.serverCacheExhausted) {
      this.cacheServer(targetServerCacheHead);
    }
  }

  private async createSpectrogramElements() {
    let page = await this.getPage(this.pagedItems);
    page = page.map((item) => this.convertJsonToVerification(item));

    if (page.length === 0) {
      this.spectrogramElements = this.noItemsTemplate();
    }

    // TODO: we might be able to do partial rendering or removal if some of the
    // needed spectrogram elements already exist
    this.spectrogramElements = page.map((item) => {
      // TODO: see if we can get rid of the type override here
      const template = this.gridItemTemplate.content.cloneNode(true) as HTMLElement;
      const spectrogram = template.querySelector<Spectrogram>("oe-spectrogram");

      if (spectrogram) {
        spectrogram.src = item.url;
      }

      return this.spectrogramTemplate(template);
    });
  }

  private spectrogramTemplate(spectrogram: HTMLElement) {
    return html` <oe-verification-grid-tile> ${spectrogram} </oe-verification-grid-tile> `;
  }

  private noItemsTemplate() {
    return html`
      <div class="no-items-message">
        <p>
          <strong>No un-validated results found</strong>
        </p>
        <p>All ${this.pagedItems} annotations are validated</p>
      </div>
    `;
  }

  public render() {
    return html`
      <div class="verification-grid">${this.spectrogramElements}</div>
      <slot @decision="${this.catchDecision}"></slot>
    `;
  }
}
