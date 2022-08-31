import fetch from 'node-fetch';

interface Splatnet2statinkApiOptions {
  userAgent?: string;
  timestamp?: number;
  idToken?: string;
}

export class Splatnet2statinkApi {
  static readonly API_URL = 'https://elifessler.com/s2s/api/gen2';

  private userAgent: string = null;
  private timestamp: string;
  private idToken: string;

  constructor(options: Splatnet2statinkApiOptions = {}) {
    this.setUserAgent(options.userAgent ?? null);
    this.setTimestamp(options.timestamp ?? Math.floor(+new Date() / 1000));
    this.setIdToken(options.idToken ?? null);
  }

  setUserAgent(newUserAgent: string) {
    this.userAgent = newUserAgent;
  }

  setTimestamp(newTimestampInSeconds: number) {
    this.timestamp = String(newTimestampInSeconds);
  }

  setIdToken(newIdToken: string) {
    this.idToken = newIdToken;
  }

  async getHash(): Promise<string> {
    const result = await fetch(Splatnet2statinkApi.API_URL, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: this.buildBodyQuery()
    });
    return Splatnet2statinkApi.getHashFromApiReponse(await result.json());
  }

  private buildHeaders() {
    if (this.userAgent === null) {
      throw 'Splatnet2statinkApi: Please set a custom User-Agent using the setUserAgent function (see: https://github.com/frozenpandaman/splatnet2statink/wiki/api-docs#integration-and-use)';
    }
    return {
      'User-Agent': this.userAgent,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  private buildBodyQuery(): string {
    if (this.idToken === null) {
      throw 'Splatnet2statinkApi: Please provide a valid ID Token';
    }
    return `naIdToken=${this.idToken}&timestamp=${this.timestamp}`;
  }

  private static getHashFromApiReponse(response: { hash: string }): string {
    return response.hash;
  }
}
