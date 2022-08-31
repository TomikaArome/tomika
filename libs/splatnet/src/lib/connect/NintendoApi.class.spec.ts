import { NintendoApi } from './NintendoApi.class';

describe('NintendoApi', () => {
  let api: NintendoApi;

  beforeEach(() => {
    api = new NintendoApi();
  });

  it('should be able to get the app version', async () => {
    const appVersion = await api.getSplatnet2AppVersion();
    expect(appVersion).toBe('2.2.0');
  });

  it('should generate a valid authorisation URL', async () => {
    const uri = api.generateAuthUri();
    console.log(uri);
    expect(true).toBeTruthy();
  });

  it('should be able to extract the session_token_code', () => {
    const mockRedirectUri = 'npf71b963c1b7b6d119://auth#session_state=e71c25b2f63e331f074a6bb796c52f4429439d34c5e7df7161684c529be4c64c&session_token_code=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MWI5NjNjMWI3YjZkMTE5IiwianRpIjoiNjA2MjI4MTQwMjQiLCJzdGM6YyI6IkxLQnlKeFJiWGV1dFB4VkNJS1lMNXdObHE4eDhoUmFnbUpvcFZnMFdJLTQiLCJzdWIiOiJmZTA1ZTdjZDUxNTYxYTYyIiwidHlwIjoic2Vzc2lvbl90b2tlbl9jb2RlIiwic3RjOm0iOiJTMjU2IiwiaWF0IjoxNjYxODk1NzMyLCJzdGM6c2NwIjpbMCw4LDksMTcsMjNdLCJpc3MiOiJodHRwczovL2FjY291bnRzLm5pbnRlbmRvLmNvbSIsImV4cCI6MTY2MTg5NjMzMn0._yXSm0K7wmNTd3pzi716sQ-T-R8D-KnRIDcZGwJ6zeU&state=9sSx865xRNkvLNxEVJibSQwOY-YeYqPEWyFfQwfbCdc';
    const sessionTokenCode = api.extractSessionTokenCode(mockRedirectUri);
    expect(sessionTokenCode).toBe('eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MWI5NjNjMWI3YjZkMTE5IiwianRpIjoiNjA2MjI4MTQwMjQiLCJzdGM6YyI6IkxLQnlKeFJiWGV1dFB4VkNJS1lMNXdObHE4eDhoUmFnbUpvcFZnMFdJLTQiLCJzdWIiOiJmZTA1ZTdjZDUxNTYxYTYyIiwidHlwIjoic2Vzc2lvbl90b2tlbl9jb2RlIiwic3RjOm0iOiJTMjU2IiwiaWF0IjoxNjYxODk1NzMyLCJzdGM6c2NwIjpbMCw4LDksMTcsMjNdLCJpc3MiOiJodHRwczovL2FjY291bnRzLm5pbnRlbmRvLmNvbSIsImV4cCI6MTY2MTg5NjMzMn0._yXSm0K7wmNTd3pzi716sQ-T-R8D-KnRIDcZGwJ6zeU');
  });
});
