import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import * as dotenv from 'dotenv';

// const DOT_ENV_FILE_LOCATION = `${__dirname}/../.env`;
//
// (async () => {
//   if (!existsSync(DOT_ENV_FILE_LOCATION)) {
//     await writeFile(
//       DOT_ENV_FILE_LOCATION,
//       `TMK_FE_URL="tomika.ink"
// TMK_BE_URL="be.tomika.ink"
// TMK_BE_IP="example.com"
// TMK_BE_IDENTITY_FILE="~/.ssh/tmk-be.pem"
// PORT="443"
// `
//     );
//   }
//
//   const configuration = dotenv.config({
//     path: DOT_ENV_FILE_LOCATION,
//   });
//
//   if (configuration.error) {
//     throw 'Malformed .env file';
//   }
//
//   const parseConfig = configuration.parsed;
//
//
// })();

interface TomikaConfig {
  backend: EnvironmentConfigs<BackendConfig>;
  frontend: EnvironmentConfigs<FrontendConfig>;
}
const isTomikaConfig = (obj: any): obj is TomikaConfig =>
  typeof obj === 'object' &&
  isEnvironmentConfigs(obj.backend) && isBackendConfig(obj.backend.development) && isBackendConfig(obj.backend.production) &&
  isEnvironmentConfigs(obj.frontend) && isFrontendConfig(obj.frontend.development) && isFrontendConfig(obj.frontend.production);

interface EnvironmentConfigs<T> {
  development: T;
  production: T;
}
const isEnvironmentConfigs = <T>(obj: any): obj is EnvironmentConfigs<T> =>
  typeof obj === 'object' && typeof obj.development === 'object' && typeof obj.production === 'object';

interface ExtendableConfig {
  extends?: string;
  [key: string]: unknown;
}
const isExtendableConfig = (obj: any): obj is ExtendableConfig =>
  typeof obj === 'object' &&
  (obj.extends === undefined || typeof obj.extends === 'string');

interface BackendConfig extends ExtendableConfig {
  frontendUris: string[];
  port: number;
}
const isBackendConfig = (obj: any): obj is BackendConfig =>
  isExtendableConfig(obj) &&
  (obj.frontendUris === undefined || obj.frontendUris instanceof Array && obj.frontendUris.reduce((acc, curr) => acc && typeof curr === 'string', true)) &&
  (obj.port === undefined || typeof obj.port === 'number');

interface FrontendConfig extends ExtendableConfig {
  backendUri: string;
  port: number;
}
const isFrontendConfig = (obj: any): obj is FrontendConfig =>
  isExtendableConfig(obj) &&
  (obj.backendUri === undefined || typeof obj.backendUri === 'string') &&
  (obj.port === undefined || typeof obj.port === 'number');

const CONFIG_FILE_LOCATION = `${__dirname}/../tomika.config.json`;

const run = async () => {
  let config: TomikaConfig;

  if (existsSync(CONFIG_FILE_LOCATION)) {
    let json: string;
    try {
      json = await readFile(CONFIG_FILE_LOCATION, { encoding: 'utf-8' });
    } catch { throw 'Error reading tomika.config.json'; }
    try {
      config = JSON.parse(json);
    } catch { throw 'Error parsing tomika.config.json: invalid JSON'; }
    if (!isTomikaConfig(config)) {
      throw 'Invalid tomika.config.json';
    }
  } else {
    config = {
      backend: {
        development: {
          frontendUris: ['http://localhost:4200'],
          port: 3333
        },
        production: {
          frontendUris: ['https://tomika.ink'],
          port: 443
        }
      },
      frontend: {
        development: {
          backendUri: 'http://localhost:3333',
          port: 4200
        },
        production: {
          backendUri: 'https://be.tomika.ink',
          port: 443
        }
      }
    };
    const json = JSON.stringify(config, null, 2) + '\n';
    try {
      await writeFile(CONFIG_FILE_LOCATION, json, { encoding: 'utf-8' });
    } catch { throw 'Error writing to tomika.config.json'; }
  }

  const projects = ['backend', 'frontend'];
  for (const project of projects) {
    const environmentsFolderLocation = `${__dirname}/../apps/${project}/src/environments`;
    if (!existsSync(environmentsFolderLocation)) {
      mkdirSync(environmentsFolderLocation);
    }
    for (const env in config[project as keyof TomikaConfig]) {
      const fileLocation = `${environmentsFolderLocation}/environment${env === 'development' ? '' : `.${env}`}.ts`;
      const configToWrite = config[project as keyof TomikaConfig][env as keyof EnvironmentConfigs<unknown>];
      try {
        await writeFile(fileLocation, `export const environment = ${JSON.stringify(configToWrite, null, 2)} as any;\n`);
      } catch { throw `Error writing to ${fileLocation}`; }
    }
  }
};

run().catch((error) => {
  console.error(error);
});
