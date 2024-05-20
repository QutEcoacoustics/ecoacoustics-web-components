import { State } from "./state";
import { IAudioMetadata, parseBlob } from "music-metadata-browser";
import bufferBuilderProcessorPath from "./buffer-builder-processor.ts?worker&url";
// import workerPath from "./worker.ts?worker&url";
import WorkerConstructor from "./worker.ts?worker&inline";
import { Size } from "../../models/rendering";
import { IAudioInformation, SpectrogramOptions } from "./models";
import {
  BUFFER_PROCESSOR_NAME,
  ProcessorSetupMessage,
  WorkerRegenerateSpectrogramMessage,
  WorkerResizeCanvasMessage,
  WorkerSetupMessage,
} from "./messages";

interface IFetchedAudio<T = Response | ArrayBuffer> {
  response: T;
  metadata: IAudioMetadata;
  audioInformation: IAudioInformation;
}
export class AudioHelper {
  private readonly spectrogramWorker: Worker | null = null;
  private readonly state: State;
  private readonly sampleBuffer: SharedArrayBuffer;

  private cachedFile!: IFetchedAudio<Response>;
  private offscreenCanvas: OffscreenCanvas | null = null;

  // This data changes every time we render.
  // Keeping them as single instance variables resulted in race conditions
  // We keep references here to disconnect the audio graph on disposal.
  private generationData: Map<number, AudioBufferSourceNode> = new Map();

  private segmentSize = 44100 as const;
  private generation = 0;

  public constructor() {
    // const spectrogramWorker = AudioHelper.worker || new Worker(new URL(workerPath, import.meta.url));
    this.spectrogramWorker = new WorkerConstructor();

    // the number of samples after which to trigger a render of the spectrogram
    // the balance of this number is a performance tradeoff
    // - too many samples and we'll use more memory and render in larger clunky chunks
    // - too few samples and we'll be rendering too often and hit performance bottlenecks
    //   e.g. with canvas painting, wasm interop, signalling primitives, etc.
    //
    // about one seconds-worth of samples
    this.state = State.createState();
    this.sampleBuffer = new SharedArrayBuffer(Float32Array.BYTES_PER_ELEMENT * this.segmentSize);
  }

  public get canvasTransferred(): boolean {
    return !!this.offscreenCanvas;
  }

  public async connect(src: string, canvas: HTMLCanvasElement, options: SpectrogramOptions): Promise<IAudioMetadata> {
    if (this.offscreenCanvas) {
      throw new Error("Connect can only be called once. Use regenerateSpectrogram to update the spectrogram.");
    }

    this.offscreenCanvas = canvas.transferControlToOffscreen();
    this.setupWorker();

    await this.render(true, src, options, this.generation);

    return this.cachedMetadata();
  }

  public async changeSource(src: string, options: SpectrogramOptions): Promise<IAudioMetadata> {
    //console.log("audio: change source");
    if (!this.spectrogramWorker) {
      throw new Error("Worker is not initialized. Call connect() first.");
    }

    const newGeneration = await this.abort();

    await this.render(true, src, options, newGeneration);

    return this.cachedMetadata();
  }

  public async regenerateSpectrogram(options: SpectrogramOptions) {
    const now = performance.now();
    //console.log("audio: regenerate");
    if (!this.spectrogramWorker) {
      throw new Error("Worker is not initialized. Call connect() first.");
    }

    const newGeneration = await this.abort();

    await this.render(false, null, options, newGeneration);

    console.log("audio: regenerate complete", performance.now() - now);
  }

  public resizeCanvas(size: Size) {
    if (!this.spectrogramWorker) {
      throw new Error("Worker is not initialized");
    }
    const message: WorkerResizeCanvasMessage = ["resize-canvas", size];
    this.spectrogramWorker.postMessage(message);
  }

  private async abort() {
    const abortedGeneration = this.generation;
    //console.log("audio: abort start", { abortedGeneration });

    const metadata = this.generationData.get(abortedGeneration);

    if (metadata) {
      const source = metadata;
      // there is no way to stop or destroy an OfflineAudioContext
      //
      // Chrome and firefox have different implementations of the audio worklet.
      // (Returning `false` from the `process` method may not stop the processor)
      // One way to tell both that we no longer want it to process is to disconnect
      // the graph! No more input, no more frame buffers!
      source.disconnect();

      this.generationData.delete(abortedGeneration);
    }

    // this is multithreaded-async
    // we use generations to trigger old processors to discard their writes
    // the worker should also stop processing even partway through it's work loop
    const generation = this.state.reset();
    this.generation = generation;

    this.state.waitForWorkerIdle();

    //console.log("audio: abort complete", { abortedGeneration, generation: this.generation });
    return generation;
  }

  /**
   * Internal render function. Does not check if we need to abort.
   * @param refreshAudio if true fetches the audio again, otherwise clones a buffer of the last response
   * @param src the source of the audio
   * @param options the spectrogram options
   */
  private async render(refreshAudio: boolean, src: string | null, options: SpectrogramOptions, generation: number) {
    const downloadedBuffer = refreshAudio ? await this.fetchAudio(src!) : await this.cachedBuffer();

    // recreate the processor every time!
    await this.createAudioContext(this.cachedMetadata(), downloadedBuffer, generation);

    this.regenerateWorker(options, this.cachedAudioInformation(), generation);

    // returns before the worker finishes painting
    // but if that matters, abort will wait for the worker to finish
    // before this method is called again
  }

  private createAudioInformation(metadata: IAudioMetadata): IAudioInformation {
    return {
      startSample: 0,
      endSample: metadata.format.duration! * metadata.format.sampleRate!,
      sampleRate: metadata.format.sampleRate!,
    };
  }

  private async fetchAudio(src: string): Promise<ArrayBuffer> {
    // TODO: see if there is a better way to do this
    // TODO: probably use web codec (AudioDecoder) for decoding partial files
    const tag = `fetch and decode audio (${this.generation})`;
    console.time(tag);
    const response = await fetch(src);

    const cachedResponse = response.clone();
    const responseBuffer = await response.arrayBuffer();
    const cachedMetadata = await parseBlob(new Blob([responseBuffer]));
    const audioInformation = this.createAudioInformation(cachedMetadata);

    this.cachedFile = {
      response: cachedResponse,
      metadata: cachedMetadata,
      audioInformation,
    };

    console.timeEnd(tag);
    return responseBuffer;
  }

  private async cachedBuffer(): Promise<ArrayBuffer> {
    const cacheClone = this.cachedFile.response.clone();
    const buffer = await this.cachedFile.response.arrayBuffer();
    // todo: needed?
    this.cachedFile.response = cacheClone;

    return buffer;
  }

  private cachedMetadata(): IAudioMetadata {
    return this.cachedFile.metadata;
  }

  private cachedAudioInformation(): IAudioInformation {
    return this.cachedFile.audioInformation;
  }

  private async createAudioContext(metadata: IAudioMetadata, buffer: ArrayBuffer, generation: number) {
    const format = metadata.format;
    const length = format.duration! * format.sampleRate! * format.numberOfChannels!;

    const context = new OfflineAudioContext({
      numberOfChannels: format.numberOfChannels!,
      sampleRate: format.sampleRate!,
      length,
    });

    const decodedBuffer = await context.decodeAudioData(buffer);
    const source = new AudioBufferSourceNode(context, { buffer: decodedBuffer });

    await context.audioWorklet.addModule(new URL(bufferBuilderProcessorPath, import.meta.url));
    const processor = new AudioWorkletNode(context, BUFFER_PROCESSOR_NAME);

    source.connect(processor).connect(context.destination);

    // do not refactor into the class - we don't want to mixup state with a
    // object that is recreated many times
    context.addEventListener("complete", () => {
      //console.log(`audio (${generation}): context complete`);
      this.state.processorComplete(generation);
    });

    //console.log(`audio (${generation}):context: setup start`, this.state.isProcessorReady(generation));
    const success = await this.setupProcessor(processor, generation);

    if (success) {
      this.generationData.set(generation, source);

      //console.log(`audio (${generation}):context: source start and start rendering`);

      source.start();
      context.startRendering();
    }

    // otherwise just forget about everything, don't bother to start.
    // no instance state to clean up
    // hopefully the garbage collector will clean up the context
  }

  // messages

  private async setupWorker() {
    const message: WorkerSetupMessage = [
      "setup",
      {
        state: this.state.stateBuffer,
        sampleBuffer: this.sampleBuffer,
        canvas: this.offscreenCanvas!,
      },
    ];

    this.spectrogramWorker!.postMessage(message, [this.offscreenCanvas!]);

    await this.state.waitForWorkerReady();
  }

  // very specifically not using instance value of this.generation
  // we want that value closed over so it can't change
  private async setupProcessor(processor: AudioWorkletNode, generation: number): Promise<boolean> {
    const message: ProcessorSetupMessage = [
      "setup",
      { state: this.state.stateBuffer, sampleBuffer: this.sampleBuffer, generation },
    ];

    processor.port.postMessage(message);

    return await this.state.waitForProcessorReady(generation);
  }

  private regenerateWorker(options: SpectrogramOptions, audioInformation: IAudioInformation, generation: number) {
    const message: WorkerRegenerateSpectrogramMessage = [
      "regenerate-spectrogram",
      {
        options,
        audioInformation,
        generation,
      },
    ];

    this.spectrogramWorker!.postMessage(message);
  }
}
