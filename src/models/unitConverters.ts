import { RenderCanvasSize, RenderWindow } from "./rendering";
import { AudioModel } from "./recordings";
import { computed, Signal } from "@lit-labs/preact-signals";
import { hertzToMels } from "../helpers/audio/mel";

export type Seconds = number;
export type Hertz = number;
export type Pixel = number;
export type Sample = number;

export type ScaleDomain<T> = [T, T];
export type ScaleRange<T> = [T, T];

export type CustomScale<T> = (value: T) => Pixel;
export type InvertScale<T> = (value: Pixel) => T;

export type TemporalScale = CustomScale<Seconds>;
export type FrequencyScale = CustomScale<Hertz>;
export type InvertTemporalScale = InvertScale<Seconds>;
export type InvertFrequencyScale = InvertScale<Hertz>;

// use we signals in the stateful unit converters so that when one value updates
// all the computed values also update
export class UnitConverter {
  public constructor(
    renderWindow: Signal<RenderWindow>,
    canvasSize: Signal<RenderCanvasSize>,
    audioModel: Signal<AudioModel>,
    melScale: Signal<boolean>,
  ) {
    this.renderWindow = renderWindow;
    this.canvasSize = canvasSize;
    this.audioModel = audioModel;
    this.melScale = melScale;
  }

  public renderWindow: Signal<RenderWindow>;
  public canvasSize: Signal<RenderCanvasSize>;
  public audioModel: Signal<AudioModel>;
  public melScale: Signal<boolean>;

  public nyquist = computed(() => this.audioModel.value.sampleRate / 2);
  private frequencyInterpolator = computed(() => (this.melScale.value ? hertzToMels : (value: Hertz): Hertz => value));

  public temporalDomain: Signal<ScaleDomain<Seconds>> = computed(() => [
    this.renderWindow.value.startOffset,
    this.renderWindow.value.endOffset,
  ]);

  public frequencyDomain: Signal<ScaleDomain<Hertz>> = computed(() => {
    const min = this.frequencyInterpolator.value(0);
    const max = this.frequencyInterpolator.value(this.nyquist.value);
    return [min, max];
  });

  public temporalRange: Signal<ScaleRange<Seconds>> = computed(() => [0, this.canvasSize.value.width]);

  public frequencyRange: Signal<ScaleRange<Hertz>> = computed(() => {
    const min = this.canvasSize.value.height;
    const max = 0;
    return [min, max];
  });

  public scaleX: Signal<TemporalScale> = computed(() => {
    const temporalDomain = this.temporalDomain.value;
    const temporalRange = this.temporalRange.value;
    const temporalMagnitude = (temporalRange[1] - temporalRange[0]) / (temporalDomain[1] - temporalDomain[0]);
    return (value: Seconds): Pixel => value * temporalMagnitude + temporalDomain[0];
  });

  public scaleXInvert: Signal<InvertTemporalScale> = computed(() => {
    const temporalDomain = this.temporalDomain.value;
    const temporalRange = this.temporalRange.value;
    const temporalMagnitude = (temporalRange[1] - temporalRange[0]) / (temporalDomain[1] - temporalDomain[0]);
    return (value: Pixel): Seconds => (value - temporalDomain[0]) / temporalMagnitude;
  });

  public scaleY: Signal<FrequencyScale> = computed(() => {
    const frequencyDomain = this.frequencyDomain.value;
    const frequencyRange = this.frequencyRange.value;
    const frequencyMagnitude = (frequencyRange[1] - frequencyRange[0]) / (frequencyDomain[1] - frequencyDomain[0]);
    return (value: Hertz) =>
      this.frequencyInterpolator.value(value) * frequencyMagnitude + frequencyDomain[0] + this.canvasSize.value.height;
  });

  public scaleYInvert: Signal<InvertFrequencyScale> = computed(() => {
    const frequencyDomain = this.frequencyDomain.value;
    const frequencyRange = this.frequencyRange.value;
    const frequencyMagnitude = (frequencyRange[1] - frequencyRange[0]) / (frequencyDomain[1] - frequencyDomain[0]);
    return (value: Pixel): Hertz =>
      (this.frequencyInterpolator.value(value) - frequencyDomain[0]) / frequencyMagnitude -
      this.canvasSize.value.height;
  });

  // private createMathematicalFunction(
  //   magnitude: number,
  //   c: number,
  // ): { scale: (...x: any[]) => any; invert: (...x: any[]) => any } {
  //   const scale = (value: number): Pixel => (value as number) * magnitude + c;
  //   const invert = (value: Pixel): number => (value - c) / magnitude;

  //   return {
  //     scale,
  //     invert,
  //   };
  // }

  // // calculate the magnitude of a linear function using
  // // (y_2 - y_1) / (x_2 - x_1)
  // private calculateMagnitude<T extends number>(domain: ScaleDomain<T>, range: ScaleRange<T>): number {
  //   return (range[1] - range[0]) / (domain[1] - domain[0]);
  // }
}

// // using a scale function will convert from units -> pixels
// // therefore, inverting the scale function will convert from pixels -> units
// // TODO: we should probably find a programmatic way to calculate the invert function from a linear function
// const temporalScale = (value: Seconds): Pixel => value * temporalMagnitude + temporalMin;
// const temporalInvert = (value: Pixel): Seconds => (value - temporalMin) / temporalMagnitude;

// // const { scale: temporalScale, invert: temporalInvert } = this.createMathematicalFunction(
// //   temporalMagnitude,
// //   temporalMin,
// // );

// // TODO: the reason why I have canvasSize.height in these scale functions is because my math is incorrect
// // the largest frequency value should correspond to the smallest pixel value
// // while the smallest frequency value should correspond to the largest pixel value
// // using a negative magnitude does not work because we end up with a negative pixel value (the current implementation)
// // therefore, to fix this, I've implemented a hack where I add the canvasSize.height to the pixel value
// const frequencyScale = (value: Hertz): Pixel =>
//   frequencyInterpolator(value) * frequencyMagnitude + frequencyMin + this.canvasSize.value.height;
// const frequencyInvert = (value: Pixel): Hertz =>
//   (frequencyInterpolator(value) - frequencyMin) / frequencyMagnitude - this.canvasSize.value.height;

// // const { scale: frequencyScale, invert: frequencyInvert } = this.createMathematicalFunction(
// //   frequencyMagnitude,
// //   frequencyMin,
// // );

// const temporal: TemporalScale = {
//   scale: temporalScale,
//   invert: temporalInvert,
//   domain: temporalDomain,
//   range: temporalRange,
// };

// const frequency: FrequencyScale = {
//   scale: frequencyScale,
//   invert: frequencyInvert,
//   domain: frequencyDomain,
//   range: frequencyRange,
// };

// return {
//   temporal,
//   frequency,
// };
