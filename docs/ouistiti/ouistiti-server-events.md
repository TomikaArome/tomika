# Server events

This page lists all the websocket events that a client may sent to the server.

- Lobbies
  - [`listLobbies`](#listlobbies)
  - [`createLobby`](#createlobby)
  - [`joinlobby`](#joinlobby)

## Lobbies

### `listLobbies`
Requests the list of currently active lobbies. The server will emit a `lobbyList` event back to the client.

The event has no payload.

### `createLobby`
Creates a lobby with the current socket as the host player. On success, the server will emit a `lobbyStatus` event for the
socket who requested it, and `lobbyUpdate` events for other sockets who are not already in a lobby of their own.

The payload is of type [`LobbyCreateParams`](https://github.com/TomikaArome/tomika/blob/f83b0f39b27b882410f849a5fd80cc0195863d38/libs/ouistiti-shared/src/lib/interfaces/lobby.interface.ts#L29-L33).
- `host` The host of the lobby controls various settings of the game such as the player order and can start the game.
  - `nickname`
  - `colour` If undefined, will be chosen at random.
  - `symbol`
- `password` May be left undefined to create a lobby without a password.
- `maxNumberOfPlayers` Defaults to the maximum of 8 players. Simply caps the capacity of the lobby: a game may be started
with fewer than specified maximum so long as there are enough people to play.

```json
{
  "host": {
    "nickname": "Thomas",
    "colour": "AQUA",
    "symbol": "SPADE"
  },
  "maxNumberOfPlayers": 4
}
```

### `joinLobby`
Makes the current socket join the lobby as a new player. On success, the server will emit a `lobbyStatus` event for the
socket who requested it, and `lobbyUpdate` events for other sockets who are not already in a lobby of their own.

The payload is of type [`LobbyJoinParams`](https://github.com/TomikaArome/tomika/blob/f83b0f39b27b882410f849a5fd80cc0195863d38/libs/ouistiti-shared/src/lib/interfaces/lobby.interface.ts#L35-L39).
- `id` The ID of the lobby to join.
- `player` The host of the lobby controls various settings of the game such as the player order and can start the game.
  - `nickname` May not be the same as an existing player in the lobby.
  - `colour` If undefined, or already taken by another player in the lobby, will be chosen at random.
  - `symbol`
- `password` Must match the lobby's password if that lobby is password protected.

```json
{
  "id": "y7kxzvtXKma_CPfloua13",
  "player": {
    "nickname": "Thomas"
  }
}
```
