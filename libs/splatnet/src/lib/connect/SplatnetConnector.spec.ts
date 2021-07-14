import { SplatnetConnector } from './SplatnetConnector';

describe('SplatnetConnector', () => {
  it('should be able to build a query', async () => {
    const parameters = {
      foo: 'bar',
      '123': '456',
      hello: 'world'
    };
    const expected = '123=456&foo=bar&hello=world';
    expect(SplatnetConnector['buildQuery'](parameters)).toBe(expected);
  });
});
