import { sentry } from './sentry.js';

describe('sentry', () => {
  it('should work', () => {
    expect(sentry()).toEqual('sentry');
  });
});
