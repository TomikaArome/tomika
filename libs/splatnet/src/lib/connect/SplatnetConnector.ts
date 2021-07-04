type SplatnetConnectorOptions = {
  cookie: string;
  sessionTokenCode: never;
} | {
  cookie: never;
  sessionTokenCode: string;
}

export class SplatnetConnector {
  private cookie: string;

  private static readonly NINTENDO_SWITCH_ONLINE_CLIENT_ID = '71b963c1b7b6d119';
  private static readonly SESSION_TOKEN_URL = 'https://accounts.nintendo.com/connect/1.0.0/api/session_token';

  constructor(options: SplatnetConnectorOptions) {
    this.cookie = options.cookie ?? null;
  }

  private getSessionToken(): string {
    return '';
  }
}
