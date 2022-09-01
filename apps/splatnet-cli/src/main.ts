import { type PromptModule } from 'inquirer';
import { SplatnetConnector } from '@TomikaArome/splatnet';

let prompt: PromptModule = null;
const getInquirerPrompt = async (): Promise<PromptModule> => {
  if (prompt !== null) { return prompt; }
  const module = await (eval(`import('inquirer')`) as Promise<typeof import('inquirer')>);
  prompt = module.createPromptModule();
  // prompt = createPromptModule();
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

  console.group()
  console.log(`
Open the following link in your browser:
${reset+cyan+authUri+reset}
Right click on ${button}Select this person${reset}, click on ${bold}Copy link address${reset}.
`);
  console.groupEnd()
  await prompt([{
    type: 'input',
    name: 'redirectUri',
    message: 'Paste the copied link here:'
  }]);
};

const readLineTest = async () => {

};
