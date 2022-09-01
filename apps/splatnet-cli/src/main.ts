import { type PromptModule } from 'inquirer';
import { SplatnetConnector } from '@TomikaArome/splatnet';
import * as readline from 'node:readline';
import { WriteStream } from 'fs';

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
      choices: [
        {
          name: 'Read line test',
          value: 'readLine'
        },
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
      case 'readLine': await readLineTest(); break;
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
  await prompt([{
    type: 'input',
    name: 'redirectUri',
    message: 'Paste the copied link here:'
  }]);
};

const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

const wrapProgressMessage = async (task: Promise<unknown>, message = '', stream: typeof process.stdout = process.stdout) => {
  let resolved = false;
  task.then(() => { resolved = true; });
  const timestampBefore = +new Date();
  let timeDiff;
  while (!resolved) {
    stream.clearLine(0);
    readline.cursorTo(process.stdout, 0);
    timeDiff = Math.floor((+new Date() - timestampBefore) / 1000);
    stream.write(`\u001b[31m\u00D7\u001b[0m ${message} \u001b[90m${timeDiff}s\u001b[0m`);
    await delay(10);
  }
  readline.cursorTo(process.stdout, 0);
  stream.clearLine(0);
  stream.write(`\u001b[32m\u2713\u001b[0m ${message} \u001b[90m${timeDiff}s\u001b[0m`);
};

const readLineTest = async () => {
  await wrapProgressMessage(delay(10000), 'Test task');
  process.exit();
};
