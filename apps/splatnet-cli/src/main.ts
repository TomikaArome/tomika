import { type PromptModule } from 'inquirer';

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
      case 'iksm': console.log('iksm'); break;
      default: continueApp = false;
    }
  }
})();
