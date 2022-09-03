import { type PromptModule } from 'inquirer';
import * as readline from 'node:readline';
import {
  extractSessionTokenCode,
  generateAuthCodeVerifier,
  generateAuthUri,
  getFToken,
  getIdToken,
  getSessionToken,
  getNsoAppVersion,
  getWebApiServerCredential,
  getUserInfo,
  getNsoGameServiceAccessToken,
  getCookie,
  NSO_GAME_SERVICES,
  NsoGameService,
  SessionTokenResponse,
  NsoConnector, NsoError
} from '@TomikaArome/splatnet';

const userAgent = 'tomika-splatnet-cli/1.0.0';

// ANSI colour codes
const reset = '\u001b[0m';
const bold = '\u001b[1m';
const cyan = '\u001b[36m';

let prompt: PromptModule = null;
const getInquirerPrompt = async (): Promise<PromptModule> => {
  if (prompt !== null) { return prompt; }
  const module = await (eval(`import('inquirer')`) as Promise<typeof import('inquirer')>);
  prompt = module.createPromptModule();
  return prompt;
};

(async () => {
  await getInquirerPrompt();

  let continueApp = true;
  while (continueApp) {
    const chosenCommand = await prompt([{
      type: 'list',
      name: 'command',
      message: 'Select a command:',
      choices: [
        {
          name: 'Test',
          value: 'test'
        },
        {
          name: 'Get session token',
          value: 'sessionToken'
        },
        {
          name: 'Generate cookie',
          value: 'cookie'
        },
        {
          type: 'separator'
        },
        {
          name: 'Exit',
          value: 'exit'
        }
      ]
    }]);
    switch (chosenCommand.command) {
      case 'test': await test(); break;
      case 'sessionToken': await generateSessionToken(); break;
      case 'cookie': await generateCookie(); break;
      default: continueApp = false;
    }
  }
})();

const test = async () => {
  try {

    const nsoConnector = await NsoConnector.get({
      sessionTokenCode: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MWI5NjNjMWI3YjZkMTE5Iiwic3ViIjoiZmUwNWU3Y2Q1MTU2MWE2MiIsImp0aSI6IjYwNzczODQ5NTIzIiwidHlwIjoic2Vzc2lvbl90b2tlbl9jb2RlIiwiaWF0IjoxNjYyMTQ2NDc0LCJpc3MiOiJodHRwczovL2FjY291bnRzLm5pbnRlbmRvLmNvbSIsInN0YzpzY3AiOlswLDgsOSwxNywyM10sInN0YzpjIjoiSmVFRjEtbzFnbEVFM0thb3pOVjlld2M2ZmpIQThHU0tVSzVEbzAxOGRVNCIsImV4cCI6MTY2MjE0NzA3NCwic3RjOm0iOiJTMjU2In0.hhniVzsb2ONCTcwxxg73liRPr7_8kbbhmwUyNP1Srxc',
      authCodeVerifier: generateAuthCodeVerifier()
    });
    console.log(nsoConnector.sessionToken);

  } catch (error) {
    if (error instanceof NsoError) {
      console.group();
      console.log(`\n\u001b[0;1;31mNSO Error caught\n\u001b[0;90m${error.code}\n\u001b[0;31m${error.message}\n\n\u001b[0m`, error.details, '\n');
      console.groupEnd();
    }
  }
}

const promptForSessionToken = async (): Promise<SessionTokenResponse> => {
  const authCodeVerifier = generateAuthCodeVerifier();
  const authUri = generateAuthUri(authCodeVerifier);

  console.log(`
Open the following link in your browser:
${reset+cyan+authUri+reset}
Right click on "${bold}Select this person${reset}", click on "${bold}Copy link address${reset}".
`);
  const redirectUri = (await prompt([{
    type: 'input',
    name: 'redirectUri',
    message: 'Paste the copied link here:'
  }])).redirectUri;
  console.log('');

  await wrapProgressMessage(getNsoAppVersion(), 'Fetching NSO app version');
  const sessionTokenCode = extractSessionTokenCode(redirectUri);
  return await wrapProgressMessage(getSessionToken(sessionTokenCode, authCodeVerifier), 'Fetching session token from Nintendo API');
};

const generateSessionToken = async () => {
  console.log(await promptForSessionToken());
};

const generateCookie = async () => {
  const selectedGame = (await prompt([{
    type: 'list',
    name: 'game',
    message: 'Select an NSO game service to generate a cookie for:',
    choices: Object.values(NSO_GAME_SERVICES).map((game: NsoGameService) => {
      return {
        name: game.name,
        value: game
      }
    })
  }])).game;
  let sessionToken: string = (await prompt([{
    type: 'input',
    name: 'sessionToken',
    message: 'Paste here your session token (leave blank to generate a new one):'
  }])).sessionToken;
  if (sessionToken.length === 0) {
    sessionToken = (await promptForSessionToken()).session_token;
  } else {
    console.log('');
  }

  const idTokenObj = await wrapProgressMessage(getIdToken(sessionToken), 'Fetching ID token from Nintendo API');
  const userInfoObj = await wrapProgressMessage(getUserInfo(idTokenObj.access_token), 'Fetching user info from Nintendo API');
  const fTokenObj1 = await wrapProgressMessage(getFToken(userAgent, idTokenObj.id_token, 1), 'First call to get the f token from IMINK API');
  const webApiServerCredentialObj = await wrapProgressMessage(getWebApiServerCredential(idTokenObj.id_token, fTokenObj1, userInfoObj), 'Fetching web API credentials from Nintendo API');
  const fTokenObj2 = await wrapProgressMessage(getFToken(userAgent, webApiServerCredentialObj.accessToken, 2), 'Second call to get the f token from IMINK API');
  const nsoGameServiceAccessTokenObj = await wrapProgressMessage(getNsoGameServiceAccessToken(webApiServerCredentialObj, fTokenObj2, selectedGame), 'Fetching web service token from Nintendo API');
  const cookie = await wrapProgressMessage(getCookie(nsoGameServiceAccessTokenObj, selectedGame), 'Fetching cookie from the NSO game service');

  console.log(`\nCookie`, cookie);
};

const wrapProgressMessage = async <T>(task: Promise<T>, message = '', stream: typeof process.stdout = process.stdout): Promise<T> => {
  const delay = (time) => new Promise(resolve => setTimeout(resolve, time));
  const symbols = ['\u2846','\u2807','\u280B','\u2819','\u2838','\u28B0','\u28E0','\u28C4'];
  let taskStatus = 0;
  task.then(() => { taskStatus = 1; }, () => { taskStatus = 2; });
  const timestampBefore = +new Date();
  let timeDiff, secondsDiff;
  while (taskStatus === 0) {
    stream.clearLine(0);
    readline.cursorTo(process.stdout, 0);
    timeDiff = +new Date() - timestampBefore;
    secondsDiff = Math.floor((timeDiff) / 1000);
    const symbol = symbols[Math.floor(timeDiff % (symbols.length * 100) / (symbols.length * 100) * symbols.length)];
    stream.write(`\u001b[96m${symbol}\u001b[0m\u001b[1m ${message} \u001b[0m\u001b[90m${secondsDiff}s\u001b[0m`);
    await delay(10);
  }
  readline.cursorTo(process.stdout, 0);
  stream.clearLine(0);
  const symbol = taskStatus === 1 ? '\u001b[32m\u2713' : '\u001b[31m\u00D7';
  stream.write(`${symbol}\u001b[0m\u001b[1m ${message} \u001b[0m\u001b[90m${secondsDiff}s\u001b[0m\n`);

  return task;
};
