import { customElement, property, queryAll, state } from "lit/decorators.js";
import { AbstractComponent } from "../../mixins/abstractComponent";
import { html, LitElement, PropertyValueMap, TemplateResult } from "lit";
import { verificationGridStyles } from "./css/style";
import { Spectrogram } from "../spectrogram/spectrogram";
import { queryAllDeeplyAssignedElements, queryDeeplyAssignedElement } from "../../helpers/decorators";
import { Verification } from "../../models/verification";
import { VerificationGridTile } from "../verification-grid-tile/verification-grid-tile";
import { Decision } from "../decision/decision";

type PageFetcher = (elapsedItems: number) => Promise<any[]>;
type SelectionObserverType = "desktop" | "tablet";
type SelectionEvent = CustomEvent<{ shiftKey: boolean; ctrlKey: boolean; index: number }>;

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
 * @property selection-behavior {desktop | tablet}
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
  public pagedItems = 0;

  @property({ attribute: "selection-behavior", type: String, reflect: true })
  public selectionBehavior: SelectionObserverType = "desktop";

  @property({ type: String })
  public src: string | undefined;

  // TODO: we probably won't need this when we create a formal spec for the
  // expected data structure
  @property({ type: String })
  public key!: string;

  @property({ attribute: "get-page", type: String })
  public getPage!: PageFetcher;

  @queryDeeplyAssignedElement({ selector: "template" })
  public gridItemTemplate!: HTMLTemplateElement;

  @queryAllDeeplyAssignedElements({ selector: "oe-decision" })
  public decisionElements!: Decision[];

  @queryAll("oe-verification-grid-tile")
  public gridTiles: NodeListOf<VerificationGridTile> | undefined;

  @state()
  private spectrogramElements: TemplateResult<1> | TemplateResult<1>[] | undefined;

  @state()
  public loading = false;

  public decisions: Verification[] = [];
  private spectrogramsLoaded = 0;
  private hiddenTiles = 0;

  private intersectionHandler = this.handleIntersection.bind(this);
  private intersectionObserver = new IntersectionObserver(this.intersectionHandler);

  private multiSelectHead: number | null = null;
  private multiSelectTail: number | null = null;

  private serverCacheHead = this.gridSize;
  private serverCacheExhausted = false;
  private highlighting = false;
  private dragStartPos = { x: 0, y: 0 };

  public disconnectedCallback(): void {
    this.intersectionObserver.disconnect();
  }

  protected updated(change: PropertyValueMap<this>): void {
    const reRenderKeys: (keyof this)[] = ["gridSize", "key"];
    const elementsToObserve = this.gridTiles;

    const sourceInvalidationKeys: (keyof this)[] = ["getPage", "src"];

    // TODO: figure out if there is a better way to do this invalidation
    if (sourceInvalidationKeys.some((key) => change.has(key))) {
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

    if (!elementsToObserve) {
      throw new Error("Fatal error: No grid tiles found");
    }

    for (const element of elementsToObserve) {
      this.intersectionObserver.observe(element);
    }

    if (reRenderKeys.some((key) => change.has(key))) {
      this.createSpectrogramElements();
    }
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      if (entry.intersectionRatio < 1) {
        // this.gridSize--;
      }
    }
  }

  private handleSubSelection(selectionEvent: SelectionEvent): void {
    switch (this.selectionBehavior) {
      case "desktop": {
        this.handleDesktopSelection(selectionEvent);
        break;
      }
      case "tablet": {
        this.handleTabletSelection(selectionEvent);
        break;
      }
      default: {
        console.error(`could not find selection behavior ${this.selectionBehavior}`);
        this.handleDesktopSelection(selectionEvent);
        break;
      }
    }

    // TODO: remove
    this.requestUpdate();
  }

  private handleDesktopSelection(selectionEvent: SelectionEvent): void {
    if (!selectionEvent.detail.ctrlKey && !selectionEvent.detail.shiftKey) {
      this.createSingleSelection(selectionEvent.detail.index);
      this.multiSelectHead = selectionEvent.detail.index;
      this.multiSelectTail = null;

      // TODO: remove
      this.requestUpdate();
      return;
    }

    if (selectionEvent.detail.shiftKey) {
      this.multiSelectTail = selectionEvent.detail.index;
    } else {
      this.multiSelectHead = selectionEvent.detail.index;
      this.multiSelectTail = null;
    }

    console.log("select from", this.multiSelectHead, "to", this.multiSelectTail);

    if (this.multiSelectHead && this.multiSelectTail) {
      this.createSubSelection(this.multiSelectHead, this.multiSelectTail);
    }
  }

  private handleTabletSelection(selectionEvent: SelectionEvent): void {
    this.createSubSelection(selectionEvent.detail.index, selectionEvent.detail.index + 1);
  }

  private createSubSelection(start: number, end: number): void {
    const gridItems = Array.from(this.gridTiles ?? []);

    for (let i = start; i < end; i++) {
      gridItems[i].selected = true;
    }
  }

  private createSingleSelection(index: number): void {
    const gridItems = Array.from(this.gridTiles ?? []);

    for (let i = 0; i < gridItems.length; i++) {
      if (i === index) {
        gridItems[i].selected = true;
        continue;
      }

      gridItems[i].selected = false;
    }
  }

  // this function can be used in a map function over the getPage results to convert
  // OE Verification data model
  private convertJsonToVerification(original: Record<string, any>): Verification {
    const possibleSrcKeys = ["src", "url", "AudioLink"];
    const possibleSubjectKeys = ["subject", "context"];

    this.key ??= possibleSrcKeys.find((key) => key in original) ?? "";
    const subject = possibleSubjectKeys.find((key) => key in original) ?? "";

    return new Verification({
      subject: original[subject],
      url: original[this.key],
      tag: null,
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

  // TODO: add stricter typing here
  private catchDecision(event: CustomEvent) {
    const decision: boolean = event.detail.value;
    const tag: any = event.detail.tag;
    const additionalTags: any[] = event.detail.additionalTags;

    // TODO: Fix this
    const gridTiles = Array.from(this.gridTiles ?? []);
    const subSelection = gridTiles.filter((tile) => tile.selected);
    const hasSubSelection = subSelection.length > 0;

    const value: Verification[] = hasSubSelection
      ? subSelection.map((tile) => tile.model)
      : gridTiles.map((tile) => tile.model);

    value.map((model: Verification) => {
      // TODO: remove this
      if (!model) return;

      model.additionalTags = additionalTags;
      model.confirmed = decision;
      model.tag = { id: undefined, text: tag };
    });

    this.dispatchEvent(new CustomEvent("decision-made", { detail: value }));

    this.decisions.push(...value);

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
    if (pagedDelta > 0) {
      this.hideGridItems(pagedDelta);
    } else {
      this.hiddenTiles = 0;
    }

    this.cacheNext();
  }

  private hideGridItems(numberOfTiles: number): void {
    // TODO: improve this
    const elementsToHide = Array.from(this.gridTiles ?? []).slice(-numberOfTiles);

    elementsToHide.forEach((element) => {
      element.style.display = "none";
    });

    this.hiddenTiles = numberOfTiles;
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

  private handleSpectrogramLoaded(): void {
    this.spectrogramsLoaded++;

    if (this.spectrogramsLoaded >= this.gridSize - this.hiddenTiles) {
      this.loading = false;
      this.spectrogramsLoaded = 0;

      this.decisionElements.forEach((element) => {
        element.disabled = false;
      });
    } else {
      this.loading = true;
    }
  }

  private handleLoading(): void {
    if (!this.loading) {
      this.spectrogramsLoaded = 0;

      console.log("loading");
      this.decisionElements.forEach((element) => {
        element.disabled = true;
      });
    }

    this.loading = true;
  }

  private createSpectrogramElements() {
    // we use a buffer so that the entire component doesn't re-render
    // every time that we add a spectrogram element
    const verificationGridBuffer = [];

    // TODO: we might be able to do partial rendering or removal if some of the
    // TODO: we might be able to set the OE verification model when creating the elements
    // needed spectrogram elements already exist
    for (let i = 0; i < this.gridSize; i++) {
      // TODO: see if we can get rid of the type override here
      const template = this.gridItemTemplate.content.cloneNode(true) as HTMLElement;
      const spectrogram = template.querySelector<Spectrogram>("oe-spectrogram");

      if (spectrogram) {
        spectrogram.addEventListener("loading", () => this.handleLoading());
        spectrogram.addEventListener("loaded", () => this.handleSpectrogramLoaded());
      }

      verificationGridBuffer.push(html`<oe-verification-grid-tile>${template}</oe-verification-grid-tile>`);
    }

    this.spectrogramElements = verificationGridBuffer;
  }

  // TODO: improve this function
  private decisionPrompt(): string {
    const tags = this.decisionElements?.map((item: Decision) => item.tag);
    const uniqueTags = Array.from(new Set(tags));

    // TODO: finish
    const tiles = Array.from(this.gridTiles ?? []);
    const numberOfSelectedItems = tiles.filter((item: VerificationGridTile) => item.selected);
    const subSelectionText = numberOfSelectedItems.length === 0 ? "all" : `all ${numberOfSelectedItems.length}`;

    return `Are ${subSelectionText} of these a ${uniqueTags.join(" or ")}?`;
  }

  private doneRenderBoxInit = false;
  private renderHighlightBox(event: MouseEvent) {
    if (event.button === 0) {
      this.highlighting = true;

      const element = this.shadowRoot!.getElementById("highlight-box");
      if (!element) {
        return;
      }

      if (!this.doneRenderBoxInit) {
        const intersectionObserver = new IntersectionObserver((event) => this.highlightIntersectionHandler(event));
        intersectionObserver.observe(element);
        this.doneRenderBoxInit = true;
      }

      element.style.display = "block";
      element.style.left = `${event.clientX}px`;
      element.style.top = `${event.clientY}px`;

      this.dragStartPos = { x: event.clientX, y: event.clientY };
    }
  }

  private highlightIntersectionHandler(entries: IntersectionObserverEntry[]) {
    console.log("intersecting", entries);
  }

  private resizeHighlightBox(event: MouseEvent) {
    if (!this.highlighting) {
      return;
    }

    const element = this.shadowRoot!.getElementById("highlight-box");
    if (!element) {
      return;
    }

    const { clientX, clientY } = event;

    const highlightWidth = clientX - this.dragStartPos.x;
    const highlightHeight = clientY - this.dragStartPos.y;

    element.style.width = `${Math.abs(highlightWidth)}px`;
    element.style.height = `${Math.abs(highlightHeight)}px`;

    if (highlightWidth < 0) {
      element.style.left = `${clientX}px`;
    }

    if (highlightHeight < 0) {
      element.style.top = `${clientY}px`;
    }
  }

  private hideHighlightBox(): void {
    this.highlighting = false;
    const element = this.shadowRoot!.getElementById("highlight-box");
    if (!element) {
      return;
    }

    console.log("stop highlight");

    // TODO: make this better
    element.style.width = "0px";
    element.style.height = "0px";
    element.style.top = "0px";
    element.style.left = "0px";
    element.style.display = "none";
  }

  private highlightBoxTemplate(): TemplateResult<1> {
    return html`<div
      id="highlight-box"
      @mouseup="${this.hideHighlightBox}"
      @mousemove="${this.resizeHighlightBox}"
    ></div>`;
  }

  private shortcutLegendTemplate(): TemplateResult<1> {
    return html`
      <div class="shortcut-legend">
        <p class="shortcut-legend-title">Keyboard Shortcuts</p>
        ${this.decisionElements?.map((element: Decision) => {
          return html`
            <span class="shortcut-legend-item">
              <span class="shortcut-legend-item-label">${element.innerText}</span>
              <kbd class="shortcut-legend-value">${element.shortcut}</kbd>
            </span>
          `;
        })}
      </div>
    `;
  }

  private noItemsTemplate(): TemplateResult<1> {
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
      <div
        @selected="${this.handleSubSelection}"
        @mousedown="${this.renderHighlightBox}"
        @mouseup="${this.hideHighlightBox}"
        @mousemove="${this.resizeHighlightBox}"
        class="verification-grid"
      >
        ${this.spectrogramElements}
      </div>
      <h2 class="verification-controls-title">${this.decisionPrompt()}</h2>
      <div class="verification-controls">
        <slot @decision="${this.catchDecision}"></slot>
      </div>
      ${this.shortcutLegendTemplate()} ${this.highlightBoxTemplate()}
    `;
  }
}
