# Repository configuration

This repository can be configured by adding a `.env` file to the root of the repository.
`.env` is ignored by git to prevent secrets from being pushed to the Github repository.
This documentation describes how to configure and what configurations are available.

## .env file

Create a `.env` file in the root of the repository.

```shell
$ touch ./.env
```

Using a text editor, add the following configuration, with values substituted with your own.
Make sure values are all quoted using double quotes `"`.

```shell
TMK_FE_URL="tomika.ink"
TMK_BE_URL="be.tomika.ink"
TMK_BE_IP="example.com"
TMK_BE_IDENTITY_FILE="~/.ssh/tmk-be.pem"
PORT="443"
```
