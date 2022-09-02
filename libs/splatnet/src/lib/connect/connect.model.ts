export interface GetSessionTokenResult {
  session_token: string;
  code: string;
}

export interface GetIdTokenResult {
  scope: string[],
  expires_in: number,
  id_token: string,
  access_token: string,
  token_type: 'Bearer'
}
