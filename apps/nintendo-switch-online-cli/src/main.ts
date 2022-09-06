import {
  NsoApp,
  NsoConnector,
  NsoError,
  NsoGame,
  NsoGameConnector,
  NsoOperation,
} from '@TomikaArome/nintendo-switch-online';
import { NsoCliConfig } from './nso-cli-config.class';
import { NsoCliSteam } from './nso-cli-stream.class';

const USER_AGENT = 'tomika-nintendo-switch-online-cli/1.0.0';

// ANSI colour codes
const reset = '\u001b[0m';
const bold = '\u001b[1m';
const cyan = '\u001b[36m';

const stream = new NsoCliSteam();
NsoApp.init({ userAgent: USER_AGENT }).currentOperation$.subscribe(
  (operation: NsoOperation) => {
    stream.wrapSpinner(operation.completed, operation.label).catch(
      () => undefined
    );
  }
);

(async () => {
  stream.log('\n');
  await stream.wrapSpinner(NsoCliConfig.load(), 'Loading configuration');
  stream.log('\n');

  let continueApp = true;
  while (continueApp) {
    const chosenCommand = await stream.prompt({
      type: 'list',
      name: 'command',
      message: 'Select a command:',
      choices: [
        {
          name: 'Get session token',
          value: 'sessionToken',
        },
        {
          name: 'Generate cookie',
          value: 'cookie',
        },
        {
          type: 'separator',
        },
        {
          name: 'Exit',
          value: 'exit',
        },
      ],
    });
    try {
      switch (chosenCommand) {
        case 'sessionToken':
          await generateSessionToken();
          break;
        case 'cookie':
          await generateCookie();
          break;
        default:
          continueApp = false;
      }
    } catch (error) {
      if (error instanceof NsoError) {
        console.group();
        console.log(
          `\n\u001b[0;31mNSO Error caught: ${error.code}\n${error.message}\u001b[0m\n\n`,
          error.details,
          '\n'
        );
        console.groupEnd();
      } else {
        throw error;
      }
    }
  }
})();

const promptRedirectUri = async (): Promise<NsoConnector> => {
  const authCodeVerifier = NsoConnector.generateAuthCodeVerifier();
  const authUri = NsoConnector.generateAuthUri(authCodeVerifier);

  stream.log(`
Open the following link in your browser:
${reset + cyan + authUri + reset}
Right click on "${bold}Select this person${reset}", click on "${bold}Copy link address${reset}".
`);
  const redirectUri = await stream.prompt({
    type: 'input',
    name: 'redirectUri',
    message: 'Paste the copied link here:',
  });
  stream.log('');

  return await NsoConnector.get({
    sessionTokenCode: NsoConnector.extractSessionTokenCode(redirectUri),
    authCodeVerifier,
    language: 'en-GB',
  });
};

const generateSessionToken = async () => {
  stream.log('\nSession token:', (await promptRedirectUri()).sessionToken);
};

const generateCookie = async () => {
  const selectedGame = await stream.prompt( {
    type: 'list',
    name: 'game',
    message: 'Select an NSO game service to generate a cookie for:',
    choices: Object.values(NsoApp.games).map((game: NsoGame) => {
      return {
        name: game.name,
        value: game,
      };
    })
  });
  const sessionToken: string = await stream.prompt({
    type: 'input',
    name: 'sessionToken',
    message: 'Session token (leave blank to generate a new one):',
  });
  const connector: NsoConnector = await (sessionToken.length === 0
    ? promptRedirectUri()
    : NsoConnector.get({ sessionToken }));
  if (sessionToken.length !== 0) {
    stream.log('');
  }

  const splatoon2Connector = await NsoGameConnector.get({
    nsoConnector: connector,
    game: selectedGame,
  });
  const cookie = await splatoon2Connector.getCookie();

  console.log(`\nCookie:`, cookie);
};
