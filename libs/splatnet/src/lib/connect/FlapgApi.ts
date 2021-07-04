type FlapgApiIidType = 'nso' | 'app';
interface FlapgApiHeaders {
  'x-token': string;
  'x-time': string;
  'x-guid': string;
  'x-hash': string;
  'x-ver': string;
  'x-iid': FlapgApiIidType;
}

export class FlapgApi {
  static readonly version = 3;
  static readonly API_URL = 'https://flapg.com/ika2/api/login?public';
}
