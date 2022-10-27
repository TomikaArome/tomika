import { NsoGameConnector } from '../connect/nso-game-connector.class';
import { NsoError, NsoErrorCode } from '../nso-error.class';

export class Splatoon2Controller {
  static API_BASE_URI = 'https://app.splatoon2.nintendo.net/api';
  static USER_AGENT =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Mobile/14G60';

  constructor(private nsoGameConnector: NsoGameConnector) {
    if (nsoGameConnector.game.abbr !== 'splat2') {
      throw new NsoError(
        'The nsoGameConnector provided is not setup to connect to Splatoon 2',
        NsoErrorCode.INCORRECT_GAME_PROVIDED,
        {
          game: nsoGameConnector.game,
        }
      );
    }
  }

  // async fetchResultsList() {
  //   const cookie = this.nsoGameConnector.getCookie();
  //   const headers = {
  //
  //   };
  //   let response;
  //   try {
  //     response = fetch(`${Splatoon2.API_BASE_URI}/results`, {
  //       method: 'GET'
  //     });
  //   } catch (error) {
  //
  //   }
  // }
}
