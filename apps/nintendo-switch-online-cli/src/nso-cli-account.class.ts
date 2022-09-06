import { NsoConnector } from '@TomikaArome/nintendo-switch-online';
import { NsoCliSerialisedAccount } from './model/nso-cli-config.model';

export class NsoCliAccount {
  private _nsoConnector: NsoConnector;
  get nsoConnector(): NsoConnector {
    return this._nsoConnector;
  }

  get id(): string {
    return this.nsoConnector?.nintendoAccountId ?? this.loadedId;
  }
  get nickname(): string {
    return this.nsoConnector?.nickname ?? this.loadedNickname;
  }

  constructor(private loadedSessionToken: string, private loadedId: string, private loadedNickname: string) {
    NsoConnector.get({ sessionToken: loadedSessionToken }).then((connector: NsoConnector) => {
      this._nsoConnector = connector;
    });
  }

  serialise(): NsoCliSerialisedAccount {
    return {
      id: this.id,
      nickname: this.nickname,
      sessionToken: this.nsoConnector.sessionToken
    };
  }
}
