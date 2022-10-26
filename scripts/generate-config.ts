import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';

interface TomikaConfig {
  [key: string]: ProjectConfig | RepositoryConfig;
}
const isTomikaConfig = (obj: any): obj is TomikaConfig =>
  typeof obj === 'object' &&
  Object.entries(obj as Object).reduce((acc, [currKey, currValue]) => acc && ((currKey === 'repository' && isRepositoryConfig(currValue)) || isProjectConfig(currValue)), true);

interface RepositoryConfig {
  backendIp?: string;
  backendIdentityFile?: string;
}
const isRepositoryConfig = (obj: any): obj is RepositoryConfig =>
  typeof obj === 'object' &&
  (obj.backendIp === undefined || typeof obj.backendIp === 'string') &&
  (obj.backendIdentityFile === undefined || typeof obj.backendIdentityFile === 'string');

interface ProjectConfig {
  [key: string]: EnvironmentConfig;
}
const isProjectConfig = (obj: any): obj is ProjectConfig =>
  typeof obj === 'object' && Object.values(obj as Object).reduce((acc, curr) => acc && isEnvironmentConfig(curr), true);

interface EnvironmentConfig {
  extends?: string;
  [key: string]: unknown;
}
const isEnvironmentConfig = (obj: any): obj is EnvironmentConfig =>
  typeof obj === 'object' &&
  (obj.extends === undefined || typeof obj.extends === 'string');

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
          extends: "backend:development",
          frontendUris: ['https://tomika.ink'],
          port: 443
        }
      },
      frontend: {
        development: {
          backendUri: 'http://localhost:3333'
        },
        production: {
          extends: "frontend:development",
          backendUri: 'https://be.tomika.ink'
        }
      },
      ouistiti: {
        development: {
          extends: "backend:development"
        },
        production: {
          extends: "backend:production"
        }
      }
    };
    const json = JSON.stringify(config, null, 2) + '\n';
    try {
      await writeFile(CONFIG_FILE_LOCATION, json, { encoding: 'utf-8' });
    } catch { throw 'Error writing to tomika.config.json'; }
  }

  // Define function which will extend an environment config based on the "extends" property
  const extendConfig = (configToExtend: EnvironmentConfig, dontExtend: string[] = []): EnvironmentConfig => {
    // No more "extends"
    if (configToExtend.extends === undefined) { return configToExtend; }
    // "extends" exists, but we already extended (avoid loops)
    if (dontExtend.indexOf(configToExtend.extends) > -1) {
      const configToExtendCopy: EnvironmentConfig = { ...configToExtend };
      delete configToExtendCopy.extends;
      return configToExtendCopy;
    }
    // "extends" exists, and wasn't already extended
    const [projectNameToExtend, envNameToExtend] = configToExtend.extends.split(':');
    const projectToExtend = config[projectNameToExtend as keyof TomikaConfig];
    if (isProjectConfig(projectToExtend) && Object.keys(projectToExtend).indexOf(envNameToExtend) > -1) {
      const configToExtendCopy = {
        ...extendConfig(projectToExtend[envNameToExtend as keyof ProjectConfig] as EnvironmentConfig, [...dontExtend, configToExtend.extends]),
        ...configToExtend
      } as EnvironmentConfig;
      delete configToExtendCopy.extends;
      return configToExtendCopy;
    }
    return configToExtend;
  };

  // Generate project specific configurations based on environment
  for (const [projectName, project] of Object.entries(config)) {
    if (isProjectConfig(project)) {
      const isLib = existsSync(`${__dirname}/../libs/${projectName}`);
      const environmentsFolderLocation = `${__dirname}/../${isLib ? 'libs' : 'apps'}/${projectName}/src/environments`;
      if (!existsSync(environmentsFolderLocation)) {
        mkdirSync(environmentsFolderLocation);
      }
      for (const [environmentName, environment] of Object.entries(project)) {
        const fileLocation = `${environmentsFolderLocation}/environment${environmentName === 'development' ? '' : `.${environmentName}`}.ts`;

        const configToWrite = {
          ...extendConfig(environment, [`${projectName}:${environmentName}`]),
          environment: environmentName
        };
        delete configToWrite.extends;
        try {
          await writeFile(fileLocation, `export const environment = ${JSON.stringify(configToWrite, null, 2)} as any;\n`, { encoding: 'utf-8' });
        } catch { throw `Error writing to ${fileLocation}`; }
      }
    }
  }

  // Generate .env file for use in shell scripts
  const dotEnvFileLocation = `${__dirname}/../.env`;
  let dotEnvContents = '';
  if (config.repository) {
    for (let key in config.repository) {
      const snakeCaseKey = 'TMK_' + key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).toUpperCase();
      const value = config.repository[key as keyof RepositoryConfig];
      dotEnvContents += `${snakeCaseKey}="${value}"\n`;
    }
  }
  try {
    await writeFile(dotEnvFileLocation, dotEnvContents, { encoding: 'utf-8' });
  } catch { throw 'Error writing to .env'; }
};

run().catch((error) => {
  console.error(error);
});
