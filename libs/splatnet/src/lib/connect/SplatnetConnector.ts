import { randomBytes, createHash } from 'crypto';

type SplatnetConnectorOptions =
  | {
      cookie: string;
      sessionTokenCode: never;
    }
  | {
      cookie: never;
      sessionTokenCode: string;
    };

export class SplatnetConnector {
  private cookie: string;

  private static readonly NINTENDO_SWITCH_ONLINE_CLIENT_ID = '71b963c1b7b6d119';
  private static readonly SESSION_TOKEN_URL =
    'https://accounts.nintendo.com/connect/1.0.0/api/session_token';
  private static readonly AUTHORIZE_URL =
    'https://accounts.nintendo.com/connect/1.0.0/authorize';

  constructor(options: SplatnetConnectorOptions) {
    this.cookie = options.cookie ?? null;
  }

  private getSessionToken(): string {
    return '';
  }

  static generateAuthUrl(authCodeVerifier: string) {
    const state = SplatnetConnector.toUrlSafeBase64Encode(randomBytes(36));

    const authCvHash = createHash('sha256');
    authCvHash.update(authCodeVerifier);
    const authCodeChallenge = SplatnetConnector.toUrlSafeBase64Encode(
      authCvHash.digest()
    );
  }

  static generateAuthCodeVerifier(): string {
    return SplatnetConnector.toUrlSafeBase64Encode(randomBytes(32));
  }

  private static toUrlSafeBase64Encode(val): string {
    return val
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private static buildQuery = (parameters: { [key: string]: string }) => {
    return Object.entries(parameters)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
  };
}
