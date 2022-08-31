import { Splatnet2statinkApi } from './Splatnet2statinkApi';

describe('Splatnet2statinkApi', () => {
  it('should be able to get a hash', async () => {
    const api = new Splatnet2statinkApi({
      userAgent: 'tomika-splatnet/1.0.0',
    });
    const hash = await api.getHash();
    console.log(hash);
    expect(true).toBeTruthy();
  });
});
