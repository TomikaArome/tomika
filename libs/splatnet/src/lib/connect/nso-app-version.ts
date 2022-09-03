import fetch from 'node-fetch';
import { NsoError, NsoErrorCode } from '../NsoError';

const NSO_APP_APPLE_STORE_URI = 'https://apps.apple.com/us/app/nintendo-switch-online/id1234806557';

let nsoAppVersion: string = null;
export const getNsoAppVersion = async (): Promise<string> => {
  if (!nsoAppVersion) {
    await fetchNsoAppVersionFromAppleStore();
  }
  return nsoAppVersion;
};

export const fetchNsoAppVersionFromAppleStore = async () => {
  let htmlResult;
  try {
    htmlResult = await fetch(NSO_APP_APPLE_STORE_URI, {
      method: 'GET',
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml',
      },
    });
  } catch (error) {
    throw new NsoError('Could not fetch NSO app version', NsoErrorCode.NSO_APP_VERSION_FETCH_FAILED, { error });
  }
  const versionRegex = /^(.*)Version ([0-9]+\.[0-9]+\.[0-9]+)(.*)/;
  const htmlLines = (await htmlResult.text()).split(/(\r\n|\r|\n)/g);
  const lineWithVersion = htmlLines.find((htmlLine: string) => /whats-new__latest__version/.test(htmlLine));
  if (lineWithVersion && versionRegex.test(lineWithVersion)) {
    nsoAppVersion = lineWithVersion.replace(versionRegex, '$2');
  } else {
    throw new NsoError('Version number not found in Apple Store NSO app page', NsoErrorCode.NSO_APP_VERSION_FETCH_FAILED);
  }
};

export const setNsoAppVersion = (version: string) => {
  if (!/^[0-9]+\.[0-9]+\.[0-9]+/.test(version)) {
    throw new NsoError('NSO app version provided badly formatted', NsoErrorCode.NSO_APP_VERSION_BADLY_FORMATTED, {
      provided: version
    });
  }
  nsoAppVersion = version;
};
