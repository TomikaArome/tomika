import { type PromptModule } from 'inquirer';
import * as readline from 'node:readline';
import {
  NsoApp,
  NsoConnector,
  NsoError,
  NsoGame,
  NsoGameConnector,
  NsoOperation,
} from '@TomikaArome/nintendo-switch-online';

const USER_AGENT = 'tomika-nintendo-switch-online-cli/1.0.0';

// ANSI colour codes
const reset = '\u001b[0m';
const bold = '\u001b[1m';
const cyan = '\u001b[36m';

let prompt: PromptModule = null;
const getInquirerPrompt = async (): Promise<PromptModule> => {
  if (prompt !== null) {
    return prompt;
  }
  const module = await (eval(`import('inquirer')`) as Promise<
    typeof import('inquirer')
  >);
  prompt = module.createPromptModule();
  return prompt;
};

const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

NsoApp.init({ userAgent: USER_AGENT }).currentOperation$.subscribe(
  (operation: NsoOperation) => {
    wrapProgressMessage(operation.completed, operation.label).catch(
      () => undefined
    );
  }
);

(async () => {
  await getInquirerPrompt();

  let continueApp = true;
  while (continueApp) {
    const chosenCommand = await prompt([
      {
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
      },
    ]);
    try {
      switch (chosenCommand.command) {
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
        await delay(20);
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

  console.log(`
Open the following link in your browser:
${reset + cyan + authUri + reset}
Right click on "${bold}Select this person${reset}", click on "${bold}Copy link address${reset}".
`);
  const redirectUri = (
    await prompt([
      {
        type: 'input',
        name: 'redirectUri',
        message: 'Paste the copied link here:',
      },
    ])
  ).redirectUri;
  console.log('');

  return await NsoConnector.get({
    sessionTokenCode: NsoConnector.extractSessionTokenCode(redirectUri),
    authCodeVerifier,
    language: 'en-GB',
  });
};

const generateSessionToken = async () => {
  const sessionToken = (await promptRedirectUri()).sessionToken;
  await delay(20);
  console.log('\nSession token:', sessionToken);
};

const generateCookie = async () => {
  const selectedGame = (
    await prompt([
      {
        type: 'list',
        name: 'game',
        message: 'Select an NSO game service to generate a cookie for:',
        choices: Object.values(NsoApp.games).map((game: NsoGame) => {
          return {
            name: game.name,
            value: game,
          };
        }),
      },
    ])
  ).game;
  const sessionToken: string = (
    await prompt([
      {
        type: 'input',
        name: 'sessionToken',
        message: 'Session token (leave blank to generate a new one):',
      },
    ])
  ).sessionToken;
  const connector: NsoConnector = await (sessionToken.length === 0
    ? promptRedirectUri()
    : NsoConnector.get({ sessionToken }));
  if (sessionToken.length !== 0) {
    console.log('');
  }

  const splatoon2Connector = await NsoGameConnector.get({
    nsoConnector: connector,
    game: selectedGame,
  });
  const cookie = await splatoon2Connector.getCookie();

  await delay(20);
  console.log(`\nCookie:`, cookie);
};

const wrapProgressMessage = async <T>(
  task: Promise<T>,
  message = '',
  stream: typeof process.stdout = process.stdout
): Promise<T> => {
  const symbols = [
    '\u2846',
    '\u2807',
    '\u280B',
    '\u2819',
    '\u2838',
    '\u28B0',
    '\u28E0',
    '\u28C4',
  ];
  let taskStatus = 0;
  task.then(
    () => {
      taskStatus = 1;
    },
    () => {
      taskStatus = 2;
    }
  );
  const timestampBefore = +new Date();
  let timeDiff, secondsDiff;
  while (taskStatus === 0) {
    stream.clearLine(0);
    readline.cursorTo(process.stdout, 0);
    timeDiff = +new Date() - timestampBefore;
    secondsDiff = Math.floor(timeDiff / 1000);
    const symbol =
      symbols[
        Math.floor(
          ((timeDiff % (symbols.length * 100)) / (symbols.length * 100)) *
            symbols.length
        )
      ];
    stream.write(
      `\u001b[96m${symbol}\u001b[0m\u001b[1m ${message} \u001b[0m\u001b[90m${secondsDiff}s\u001b[0m`
    );
    await delay(10);
  }
  readline.cursorTo(process.stdout, 0);
  stream.clearLine(0);
  const symbol = taskStatus === 1 ? '\u001b[32m\u2713' : '\u001b[31m\u00D7';
  stream.write(
    `${symbol}\u001b[0m\u001b[1m ${message} \u001b[0m\u001b[90m${secondsDiff}s\u001b[0m\n`
  );

  return task;
};
