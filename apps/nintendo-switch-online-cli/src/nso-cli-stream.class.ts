import { DistinctQuestion, PromptModule, SeparatorOptions } from 'inquirer';
import { Options as OraOptions, Ora } from 'ora';
import { NsoError } from '@TomikaArome/nintendo-switch-online';
import { NsoCliError } from './nso-cli-error.class';

export class NsoCliSteam {
  private static _prompt: PromptModule = null;
  private static async getPrompt(): Promise<PromptModule> {
    if (NsoCliSteam._prompt !== null) {
      return NsoCliSteam._prompt;
    }
    const module = await (eval(`import('inquirer')`) as Promise<
      typeof import('inquirer')
    >);
    NsoCliSteam._prompt = module.createPromptModule();
    return NsoCliSteam._prompt;
  }

  private static _ora: (options?: string | OraOptions) => Ora = null;
  private static async getOraPromise(): Promise<
    (options?: string | OraOptions) => Ora
  > {
    if (NsoCliSteam._ora !== null) {
      return NsoCliSteam._ora;
    }
    const module = await (eval(`import('ora')`) as Promise<
      typeof import('ora')
    >);
    NsoCliSteam._ora = module.default;
    return NsoCliSteam._ora;
  }

  readonly separator = { type: 'separator' } as SeparatorOptions;

  emptyLine() {
    console.log('');
  }

  handleNsoError(error: Error) {
    if (error instanceof NsoError || error instanceof NsoCliError) {
      console.group();
      console.log(
        `\n\u001b[0;31mNSO Error caught: ${error.code}\n${error.message}\u001b[0m\n\n`,
        error.details,
        '\n'
      );
      console.groupEnd();
    } else {
      console.error(error);
    }
  }

  async wrapSpinner<T>(promise: Promise<T>, message = ''): Promise<T> {
    const startTimestamp = +new Date();
    const spinner = (await NsoCliSteam.getOraPromise())({
      text: `${message} \u001b[0;90m0s\u001b[0m`,
      spinner: {
        interval: 80,
        frames: [
          '\u2846',
          '\u2807',
          '\u280B',
          '\u2819',
          '\u2838',
          '\u28B0',
          '\u28E0',
          '\u28C4',
        ],
      },
    }).start();
    const updateTimer = () => {
      const currentTimestamp = +new Date();
      const secondsDiff = Math.floor(
        (currentTimestamp - startTimestamp) / 1000
      );
      spinner.text = `${message} \u001b[0;90m${secondsDiff}s\u001b[0m`;
    };
    const intervalId = setInterval(updateTimer, 1000);
    try {
      const result = await promise;
      clearInterval(intervalId);
      updateTimer();
      spinner.succeed();
      return result;
    } catch (error) {
      clearInterval(intervalId);
      updateTimer();
      spinner.fail();
    }
  }

  async prompt(question: DistinctQuestion) {
    const promptModule = await NsoCliSteam.getPrompt();
    const answers = await promptModule([question]);
    return answers[question.name];
  }
}
