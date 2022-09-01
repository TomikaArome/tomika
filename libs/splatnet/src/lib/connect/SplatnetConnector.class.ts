import * as crypto from 'crypto';
import fetch from 'node-fetch';

type SplatnetConnectorOptions = {
  cookie: string;
  sessionTokenCode: never;
} | {
  cookie: never;
  sessionTokenCode: string;
};

interface GetSessionTokenResult {
  session_token: string;
  code: string;
}

export class SplatnetConnector {
  static readonly NSO_APP_APPLE_STORE_URI =
    'https://apps.apple.com/us/app/nintendo-switch-online/id1234806557';

  static readonly BASE_URI = 'https://accounts.nintendo.com/connect/1.0.0';
  static readonly AUTH_URI = `${SplatnetConnector.BASE_URI}/authorize`;
  static readonly API_URI = `${SplatnetConnector.BASE_URI}/api`;

  static readonly REDIRECT_URI = 'npf71b963c1b7b6d119://auth';
  static readonly CLIENT_ID = '71b963c1b7b6d119';
  static readonly SCOPES = [
    'openid',
    'user',
    'user.birthday',
    'user.mii',
    'user.screenName',
  ];

  private static splatnet2AppVersion: string = null;

  private static toUrlSafeBase64Encode(value: Buffer): string {
    return value
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private static generateUrlSafeBase64String(size = 32): string {
    return this.toUrlSafeBase64Encode(crypto.randomBytes(size));
  }

  /**
   * Gets the Splatnet 2 app version from the Apple Store page by scraping the HTML
   */
  static async getSplatnet2AppVersion() {
    if (SplatnetConnector.splatnet2AppVersion) {
      return SplatnetConnector.splatnet2AppVersion;
    }
    const htmlResult = await fetch(SplatnetConnector.NSO_APP_APPLE_STORE_URI, {
      method: 'GET',
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml',
      },
    });
    const versionRegex = /^(.*)Version ([0-9]+\.[0-9]+\.[0-9]+)(.*)/;
    const htmlLines = (await htmlResult.text()).split(/(?:\r\n|\r|\n)/g);
    const lineWithVersion = htmlLines.find((htmlLine: string) =>
      /whats-new__latest__version/.test(htmlLine)
    );
    if (versionRegex.test(lineWithVersion)) {
      const version = lineWithVersion.replace(
        /^(.*)Version ([0-9]+\.[0-9]+\.[0-9]+)(.*)/,
        '$2'
      );
      SplatnetConnector.splatnet2AppVersion = version;
      return version;
    } else {
      throw 'Could not fetch NSO app version';
    }
  }

  static generateAuthUri(authCodeVerifier: string) {
    const authState = SplatnetConnector.generateUrlSafeBase64String();
    const authCvHash = crypto.createHash('sha256');
    authCvHash.update(authCodeVerifier);
    const authCodeChallenge = SplatnetConnector.toUrlSafeBase64Encode(
      authCvHash.digest()
    );

    const params = new URLSearchParams({
      state: authState,
      redirect_uri: SplatnetConnector.REDIRECT_URI,
      client_id: SplatnetConnector.CLIENT_ID,
      scope: SplatnetConnector.SCOPES.join(' '),
      response_type: 'session_token_code',
      session_token_code_challenge: authCodeChallenge,
      session_token_code_challenge_method: 'S256',
      theme: 'login_form',
    });
    return `${SplatnetConnector.AUTH_URI}?${params.toString()}`;
  }

  static generateAuthCodeVerifier(): string {
    return SplatnetConnector.generateUrlSafeBase64String();
  }

  private cookie: string;

  constructor(params: SplatnetConnectorOptions) {
    this.cookie = params.cookie ?? null;
  }

  static extractSessionTokenCode(redirectUri: string): string {
    return redirectUri.replace(
      /^(.*)session_token_code=([a-zA-Z0-9\\._-]*)(&.*)?$/,
      '$2'
    );
  }

  static async getSessionToken(sessionTokenCode: string, authCodeVerifier: string) {
    const result = await fetch(`${SplatnetConnector.API_URI}/session_token`, {
      method: 'POST',
      headers: {
        'User-Agent': `OnlineLounge/${await SplatnetConnector.getSplatnet2AppVersion()} NASDKAPI Android`,
        'Accept-Language': 'en-US',
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': '540',
        Host: 'accounts.nintendo.com',
        Connection: 'Keep-Alive',
        'Accept-Encoding': 'gzip',
      },
      body: new URLSearchParams({
        client_id: SplatnetConnector.CLIENT_ID,
        session_token_code: sessionTokenCode,
        session_token_code_verifier: authCodeVerifier,
      }).toString(),
    });
    const objFromJson = await result.json() as GetSessionTokenResult;
    return objFromJson.session_token;
  }
}
