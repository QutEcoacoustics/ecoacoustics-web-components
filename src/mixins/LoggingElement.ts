import {dedupeMixin} from '@open-wc/dedupe-mixin';

export declare class ILogging {
  logger: Console;
}

export type Constructor<T extends {} = {}> = new (...args: any[]) => T;

export const DefaultLogger = new Proxy(console, {});

/**
 * Add logging capability to classes. This wraps the console logger so that
 * tests are capable of spying on the different logging methods.
 *
 * @param superclass The child class to extend, a default cannot be set because
 * of https://github.com/runem/lit-analyzer/issues/212. Instead if there is no
 * base class use: `class {}`.
 */
export const WithLogging = dedupeMixin(<T extends Constructor>(superclass: T) => {
  class LoggingClass extends superclass {
    constructor(...args: any[]) {
      super(...args);
      this.logger = DefaultLogger;
    }

    /** Logs a message to the current console provider */
    public logger: Console;
  }

  return LoggingClass as Constructor<ILogging> & T;
});
