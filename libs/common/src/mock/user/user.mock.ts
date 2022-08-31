export const discordAccountMock = {
  accountType: 'discord',
  id: '248813886583603210',
  name: 'Tomika',
  discriminator: '4051',
  avatarHash: '101db103245e43089b1f70fcb74f0efc',
};

export const adminUserMock = {
  id: 0,
  groupIds: [0],
  connectedAccountInformation: [discordAccountMock],
};

export const user1Mock = {
  id: 1,
  permissionIds: [5],
  groupIds: [1, 2],
  connectedAccountInformation: [discordAccountMock],
};
