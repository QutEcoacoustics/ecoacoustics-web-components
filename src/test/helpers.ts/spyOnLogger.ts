import {defineCE} from '@open-wc/testing';
import {LitElement} from 'lit';
import {SinonSpiedInstance, spy} from 'sinon';
import {Constructor, ILogging} from '../../mixins/LoggingElement';

export function spyOnLogger<T extends Constructor<LitElement> & Constructor<ILogging>>(target: T) {
  let loggerSpy!: SinonSpiedInstance<Console>;
  const tag = defineCE(
    class extends target {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(...args: any[]) {
        super(...args);
        loggerSpy = spy(this.logger);
      }
    }
  );

  return {getSpy: () => loggerSpy, tag};
}
