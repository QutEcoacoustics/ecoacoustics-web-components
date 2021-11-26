import {defineCE} from '@open-wc/testing';
import {LitElement} from 'lit';
import {unsafeStatic} from 'lit/static-html.js';
import {SinonSandbox, SinonSpiedInstance} from 'sinon';
import {Constructor, ILogging} from '../../src/mixins/LoggingElement';

export function spyOnLogger<T extends Constructor<LitElement> & Constructor<ILogging>>(
  target: T,
  sandbox: SinonSandbox
) {
  let loggerSpy!: SinonSpiedInstance<Console>;
  const tag = defineCE(
    class extends target {
      constructor(...args: any[]) {
        super(...args);
        loggerSpy = sandbox.spy(this.logger);
      }
    }
  );

  return {getSpy: () => loggerSpy, tag: unsafeStatic(tag)};
}
