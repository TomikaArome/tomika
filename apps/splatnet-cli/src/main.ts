import { type PromptModule } from 'inquirer';
import { SplatnetConnector } from '@TomikaArome/splatnet';
import * as readline from 'node:readline';

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
          name: 'Generate iksm cookie',
          value: 'iksm'
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
      case 'iksm': await generateIksm(); break;
      default: continueApp = false;
    }
  }
})();

const generateIksm = async () => {
  const authCodeVerifier = SplatnetConnector.generateAuthCodeVerifier();
  const authUri = SplatnetConnector.generateAuthUri(authCodeVerifier);

  const reset = '\u001b[0m';
  const bold = '\u001b[1m';
  const cyan = '\u001b[36m';
  const button = '\u001b[41m\u001b[37m';

  console.log(`
Open the following link in your browser:
${reset+cyan+authUri+reset}
Right click on ${button}Select this person${reset}, click on ${bold}Copy link address${reset}.
`);
  const redirectUri = (await prompt([{
    type: 'input',
    name: 'redirectUri',
    message: 'Paste the copied link here:'
  }])).redirectUri;
  const sessionTokenCode = SplatnetConnector.extractSessionTokenCode(redirectUri);
  const sessionTokenPromise = SplatnetConnector.getSessionToken(sessionTokenCode, authCodeVerifier);
  await wrapProgressMessage(sessionTokenPromise, 'Fetching session token from Nintendo API');
  console.log(await sessionTokenPromise);
};

const wrapProgressMessage = async (task: Promise<unknown>, message = '', stream: typeof process.stdout = process.stdout) => {
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
};
