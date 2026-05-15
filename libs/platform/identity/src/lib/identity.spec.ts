import { identity } from './identity.js';

describe('identity', () => {
  it('should work', () => {
    expect(identity()).toEqual('identity');
  });
});
