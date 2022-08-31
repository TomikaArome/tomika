# Server events

This page lists all the websocket events that a client may sent to the server.

- [Lobbies](#lobbies)
  - [`listLobbies`](#listlobbies)
  - [`createLobby`](#createlobby)
  - [`joinLobby`](#joinlobby)
  - [`leaveLobby`](#leavelobby)
  - [`updateLobby`](#updatelobby)
- [Players](#players)
  - [`updatePlayer`](#updateplayer)

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
- `maxNumberOfPlayers` Defaults to the maximum of 8 players. Caps the capacity of the lobby: a game may be started
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

Makes the current socket join the lobby as a new player. On success, the server will emit a `lobbyStatus` event to the
socket who requested it, as well as the sockets already in the lobby, and a `lobbyUpdate` event for any other socket who
is not already in a lobby of their own.

The payload is of type [`LobbyJoinParams`](https://github.com/TomikaArome/tomika/blob/f83b0f39b27b882410f849a5fd80cc0195863d38/libs/ouistiti-shared/src/lib/interfaces/lobby.interface.ts#L35-L39).

- `id` The ID of the lobby to join.
- `player` The host of the lobby controls various settings of the game such as the player order and can start the game.
  - `nickname` May not be the same as an existing player in the lobby.
  - `colour` If undefined, or already taken by another player in the lobby, will be chosen at random.
  - `symbol`
- `password` Must match the lobby's password if that lobby is password protected.

```json
{
  "id": "WsYuuQ8JP_",
  "player": {
    "nickname": "Thomas"
  }
}
```

### `leaveLobby`

Makes the current socket leave their lobby. On success, the server will emit a `lobbyStatus` event to the socket who
requested it, as well as the sockets already in the lobby, and a `lobbyUpdate` event for any other socket who is not
already in a lobby of their own.

This event has no payload. If a socket attempts to leave a lobby while they are not part of any lobby, nothing special
will happen.

### `updateLobby`

Changes the current lobby's settings. This action can only be performed by the lobby's current host. On success, the
server will emit a `lobbyStatus` event to each of the sockets in the lobby, and a `lobbyUpdate` event for any other
socket who is not already in a lobby of their own.

If a socket attempts to update a lobby while they are not part of any lobby, or if they are not a host of their lobby,
an error will sent back.

The payload is of type [`LobbyUpdateParams`]().

- `maxNumberOfPlayers` Caps the capacity of the lobby: a game may be started with fewer than specified maximum so long
  as there are enough people to play.
- `hostId` The ID of a player who should be granted host. Only one player may be host of a lobby at a time, so this will
  revoke permission from the current host.
- `playerOrder` An array of player IDs in the order that they should play in the game. All player IDs from the current
  lobby should be included or an error will be returned. Any string that does not match an existant player ID in the lobby
  will be ignored.

```json
{
  "maxNumberOfPlayers": 4,
  "hostId": "KfaB3Zz0zU",
  "playerOrder": ["KfaB3Zz0zU", "9mOwZjv0fM"]
}
```

## Players

### `updatePlayer`

Updates a player's settings. This action may be performed by the concerned player, or the host of the lobby for any player
in that lobby. On success, the server will emit a `lobbyStatus` event to each of the sockets in the lobby, and a
`lobbyUpdate` event for any other socket who is not already in a lobby of their own.

If a socket attempts to update information of a player they do not have permission to modify, an error will be sent back.

The payload is of type [`PlayerUpdateParams`]().

- `id` ID of player to modify. Optional if modifying self's settings.
- `nickname`
- `colour`
- `symbol`

```json
{
  "id": "KfaB3Zz0zU",
  "nickname": "Thomas",
  "colour": "AQUA",
  "symbol": "SPADE"
}
```

### `kickPlayer`

Kicks a player from the lobby. This action may only be performed by the host of a lobby, and not on themselves. For
voluntarily leaving a lobby, use the `leaveLobby` event instead. On success, the server will emit a `lobbyStatus` event
to each of the sockets in the lobby, and a `lobbyUpdate` event for any other socket who is not already in a lobby of
their own.

If a socket attempts to kick a player while they are not part of any lobby, or if they are not a host of their lobby,
an error will sent back.

The payload is of type [`PlayerKickParams`]().

- `id` ID of the player to kick

```json
{
  "id": "9mOwZjv0fM"
}
```
