# Repository configuration

This repository is configured entirely using `tomika.config.json`, located at the root of the repository.
Generate it the first time using the following command:

```shell
npm run generate-config
```

This script will also auto-generate other configuration files such as the ones located under the `environments` folders or the `.env` file.

These auto-generated files are ignored by git and should not be modified, only `tomika.config.json` should be modified.
`tomika.config.json` is also ignored by git, allowing you to safely store secrets in this configuration without them being pushed to the repository.

This script will also run before most operations such as serving a development server, or building for production.

## tomika.config.json configuration

The file is split into repository configuration and project configuration.

All repository configuration is simply defined as key value pairs under `repository`.

All project configuration is defined under the key with the name of the project, such as `backend` or `frontend`.
These are further split into different environments (usually `development` and `production`, though more could be added).
Each of the configurations for the environments accept the same keys but are intended for use in different contexts.
Each environment configuration may extend another environment configuration using `"extends": "<projectName>:<environmentName>"`

Example:
```json
{
  "repository": {
    // Key value pairs which will be converted for the .env file
  },
  "backend": {
    "development": {
      // Configuration for the backend project in the development environment
    },
    "production": {
      // Configuration for the backend project in the production environment
    }
  },
  "frontend": {
    "development": {
      // Configuration for the frontend project in the development environment
    },
    "production": {
      // Configuration for the frontend project in the production environment
      "extends": "frontend:development" // This will extend the configuration set for frontend development
    }
  }
}
```

### Repository configuration

| Key                   | Example value       | Type     | Description                                    |
|-----------------------|---------------------|----------|------------------------------------------------|
| `backendIp`           | `x.x.x.x`           | `string` | IP for the location of the hosted server.      |
| `backendIdentityFile` | `~/.ssh/tmk-be.pem` | `string` | Location of the identity file for configuring. |

### Project configuration
#### Backend

| Key            | Example value                                      | Type       | Description                                                                     |
|----------------|----------------------------------------------------|------------|---------------------------------------------------------------------------------|
| `frontendUris` | `['http://localhost:4200', 'https://example.com']` | `string[]` | URIs of the frontend servers allowed to connect using websocket. Used for CORS. |
| `port`         | 3333                                               | `number`   | Port number on which the backend server shall run. Defaults to 443.             |

#### Frontend

| Key          | Example value                 | Type     | Description                                                                                 |
|--------------|-------------------------------|----------|---------------------------------------------------------------------------------------------|
| `backendUri` | `https://backend.example.com` | `string` | URI of the backend server that will be used for API calls, connecting to websockets, etc... |

## secrets folder

The `secrets` folder is ignored by git and can be used to store some repository secrets that need an entire file rather than just a string, such as a public or private key.
