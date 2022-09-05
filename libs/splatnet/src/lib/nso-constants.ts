// Apple store
export const NSO_APP_APPLE_STORE_URI = 'https://apps.apple.com/us/app/nintendo-switch-online/id1234806557';

// Nintendo connect API
const CONNECT_BASE_URI = 'https://accounts.nintendo.com/connect/1.0.0';
export const AUTHORIZE_URI = `${CONNECT_BASE_URI}/authorize`;
export const SESSION_TOKEN_ENDPOINT_URI = `${CONNECT_BASE_URI}/api/session_token`;
export const TOKEN_ENDPOINT_URI = `${CONNECT_BASE_URI}/api/token`;

// Nintendo accounts API
export const USER_INFO_ENDPOINT_URI = 'https://api.accounts.nintendo.com/2.0.0/users/me';

// Nintendo web API
const WEB_BASE_URI = 'https://api-lp1.znc.srv.nintendo.net';
export const WEB_API_SERVER_CREDENTIAL_ENDPOINT_URI = `${WEB_BASE_URI}/v3/Account/Login`;
export const WEB_SERVICE_TOKEN_ENDPOINT_URI = `${WEB_BASE_URI}/v2/Game/GetWebServiceToken`;

// NSO app
export const NSO_APP_CLIENT_ID = '71b963c1b7b6d119';
export const NSO_APP_REDIRECT_URI = `npf${NSO_APP_CLIENT_ID}://auth`;
export const SCOPES = ['openid', 'user', 'user.birthday', 'user.mii', 'user.screenName'];

// Imink API URI
export const IMINK_API_F_ENDPOINT_URI = 'https://api.imink.app/f';

// Defaults
export const DEFAULT_LANGUAGE = 'en-GB';
export const TIME_DIFF_BEFORE_REGEN = 60000;
export const VERSION_CHECK_INTERVAL_DEFAULT = 3600000;
