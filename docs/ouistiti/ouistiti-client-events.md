# Client events
This page lists all the websocket events that a client may receive.

- [Errors](#errors)
  - [`error`](#error)
- [Lobbies](#lobbies)
  - [`lobbyStatus`](#lobbystatus)
  - [`lobbyList`](#lobbylist)
  - [`lobbyUpdated`](#lobbyupdated)
  - [`lobbyClosed`](#lobbyclosed)

## Errors

### `error`
Any errors thrown by requests will be emitted by the server using this event.

The payload is of type [`OuistitiError`](https://github.com/TomikaArome/tomika/blob/f83b0f39b27b882410f849a5fd80cc0195863d38/libs/ouistiti-shared/src/lib/interfaces/ouistiti-error.interface.ts#L33-L36).
- `type` The type of error. Full list available at [`OuistitiErrorType`](https://github.com/TomikaArome/tomika/blob/f83b0f39b27b882410f849a5fd80cc0195863d38/libs/ouistiti-shared/src/lib/enum/ouistiti-error-type.enum.ts).
- `detail` The detail will vary between error types.
- `param` The name of the parameter concerned by error.
- `caller` The name of the request event that triggered the error.

```json
{
  "type": "REQUIRED_PARAM",
  "param": "host.nickname",
  "caller": "createLobby"
}
```

```json
{
  "type": "STRING_TOO_LONG",
  "detail": {
    "value": "NicknameWithOverTwentyCharacters",
    "requiredLength": 20,
    "actualLength": 32
  },
  "param": "player.nickname",
  "caller": "joinLobby"
}
```

## Lobbies

### `lobbyStatus`
Emitted when the socket's lobby status is changed. A socket may only be in one lobby at a time, represented by the `lobby`
property. The `inLobby` property may be false if the socket is not in any lobby. The `playerId` property specifies which of
the players listed in the lobby info is that of the current socket.

The payload is of type [`LobbyStatus`](https://github.com/TomikaArome/tomika/blob/f83b0f39b27b882410f849a5fd80cc0195863d38/libs/ouistiti-shared/src/lib/interfaces/lobby.interface.ts#L6-L10).
```json
{
  "inLobby": false
}
```
```json
{
  "inLobby": true,
  "lobby": {
    "id": "y7kxzvtXKma_CPfloua13",
    "passwordProtected": false,
    "gameStatus": "INIT",
    "players": [
      ...
    ],
    "hostId": "lB3Gt6t9kYITX9_QWhAzh",
    "maxNumberOfPlayers": 4
  },
  "playerId": "zkn_iuMOj2KvaCLaQeIE1"
}
```

### `lobbyList`
Emitted in response to the `listLobbies` server event. Emits the full list of active lobbies, not sorted in any particular way
and regardless of joinable or not.

The payload is of type [`LobbyInfo[]`](https://github.com/TomikaArome/tomika/blob/f83b0f39b27b882410f849a5fd80cc0195863d38/libs/ouistiti-shared/src/lib/interfaces/lobby.interface.ts#L12-L21).
```json
[
  {
    "id": "y7kxzvtXKma_CPfloua13",
    "passwordProtected": false,
    "gameStatus": "INIT",
    "players": [
      ...
    ],
    "hostId": "lB3Gt6t9kYITX9_QWhAzh",
    "maxNumberOfPlayers": 4
  },
  {
    "id": "AQQTU5nhXs26qBBkj8nwj",
    ...
  },
  ...
]
```

### `lobbyUpdated`
Emitted when a lobby in the lobby list is either created or updated. This event does not emit to update the socket's current
lobby. Anything that may update the information of the lobby, or the players within, will trigger this event.

The payload is of type [`LobbyInfo`](https://github.com/TomikaArome/tomika/blob/f83b0f39b27b882410f849a5fd80cc0195863d38/libs/ouistiti-shared/src/lib/interfaces/lobby.interface.ts#L12-21).
```json
{
  "id": "y7kxzvtXKma_CPfloua13",
  "passwordProtected": false,
  "gameStatus": "INIT",
  "players": [
    ...
  ],
  "hostId": "lB3Gt6t9kYITX9_QWhAzh",
  "maxNumberOfPlayers": 4
}
```

### `lobbyClosed`
Emits when a lobby is closed.

The payload is of type [`LobbyClosed`](https://github.com/TomikaArome/tomika/blob/f83b0f39b27b882410f849a5fd80cc0195863d38/libs/ouistiti-shared/src/lib/interfaces/lobby.interface.ts#L23-L25).
```json
{
  "id": "y7kxzvtXKma_CPfloua13"
}
```
