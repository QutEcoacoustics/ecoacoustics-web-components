import {Observable, Subject, BehaviorSubject} from 'rxjs';
import {WithLogging} from '../mixins/LoggingElement';

interface AudioPlayerState {
  paused: boolean;
  playing: boolean;
  canPlay: boolean;
  muted: boolean;
  duration: number;
  ended: boolean;
  volume: number;
  currentTime: number;
  error: string | null;
}

type AudioPlayerEvent = keyof HTMLMediaElementEventMap;
type AudioWrapperEvent = {event?: AudioPlayerEvent} & AudioPlayerState;

// TODO Convert to controller
export class AudioWrapper extends WithLogging(class {}) {
  private audioElement: HTMLAudioElement;
  private $update: Subject<AudioWrapperEvent>;
  private currentState: AudioPlayerState;
  private readyStates = {
    haveNothing: 0,
    haveMetadata: 1,
    haveCurrentData: 2,
    haveFutureData: 3,
    haveEnoughData: 4,
  };
  private audioEvents: AudioPlayerEvent[] = [
    'abort',
    'canplay',
    'canplaythrough',
    'durationchange',
    'emptied',
    'ended',
    'error',
    'loadeddata',
    'loadedmetadata',
    'loadstart',
    'pause',
    'play',
    'playing',
    'progress',
    'ratechange',
    'seeked',
    'seeking',
    'suspend',
    'timeupdate',
    'volumechange',
    'waiting',
  ];

  public constructor(audioElement?: HTMLAudioElement) {
    super();
    if (!audioElement) {
      throw new Error('Audio element does not exist');
    } else {
      this.audioElement = audioElement;
    }
    this.currentState = this.getState();
    this.$update = new BehaviorSubject({event: undefined, ...this.currentState} as AudioWrapperEvent);
    this.subscribeToEvents();
  }

  /**
   * Returns an observable which triggers whenever an event update occurs on
   * the audio player
   */
  public eventUpdates(): Observable<AudioWrapperEvent> {
    return this.$update;
  }

  /**
   * Destroy the Audio Wrapper instance and unsubscribe all
   * observables/listeners
   */
  public destroy(): void {
    this.unsubscribeFromEvents();
  }

  /** Subscribe to audio player events */
  private subscribeToEvents(): void {
    this.audioEvents.map((event) => {
      return this.audioElement.addEventListener(event, this.updateState);
    });
  }

  /** Cleanup subscriptions to audio player events */
  private unsubscribeFromEvents(): void {
    this.audioEvents.map((event) => {
      return this.audioElement.removeEventListener(event, this.updateState);
    });
  }

  /**
   * Update the stored information about the audio player, and emit the results
   */
  private updateState = (event: Event) => {
    this.logger.debug(`Audio Wrapper: event detected (${event.type ?? 'unknown'})`);
    this.currentState = {...this.currentState, ...this.getState()};
    this.$update.next({event: event.type as AudioPlayerEvent, ...this.currentState});
  };

  /**
   * Extract various information about the state of the audio player
   */
  private getState(): AudioPlayerState {
    const canPlayAudio = [this.readyStates.haveFutureData, this.readyStates.haveEnoughData].includes(
      this.audioElement.readyState
    );
    return {
      paused: this.audioElement.paused,
      playing: !this.audioElement.paused,
      canPlay: canPlayAudio,
      muted: this.audioElement.muted,
      duration: this.audioElement.duration,
      ended: this.audioElement.ended,
      volume: this.audioElement.volume,
      // Note: This may need to be extracted to a requestAnimationFrame
      currentTime: this.audioElement.currentTime,
      error: this.audioElement.error?.message ?? null,
    };
  }
}
