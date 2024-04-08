export class TwoDSlice {
  public constructor(data: TwoDSlice) {
    this.x0 = data.x0;
    this.x1 = data.x1;
    this.y0 = data.y0;
    this.y1 = data.y1;
  }

  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export class Spectrogram {
  public constructor(data: Spectrogram) {
    this.startOffset = data.startOffset;
    this.endOffset = data.endOffset;
  }

  startOffset: number;
  endOffset: number;
}

// also consider: SpectrogramRenderSlice
export class RenderWindow {
  public constructor(data: RenderWindow) {
    this.startOffset = data.startOffset;
    this.endOffset = data.endOffset;
    this.lowFrequency = data.lowFrequency;
    this.highFrequency = data.highFrequency;
  }

  startOffset: number;
  endOffset: number;
  lowFrequency: number;
  highFrequency: number;
}

export class RenderCanvasSize {
  public constructor(data: RenderCanvasSize) {
    this.width = data.width;
    this.height = data.height;
  }

  width: number;
  height: number;
}
