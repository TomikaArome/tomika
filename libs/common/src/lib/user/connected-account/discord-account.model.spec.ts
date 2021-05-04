import { DiscordAccount } from './discord-account.model';

describe('DiscordAccount', () => {
  let account: DiscordAccount;

  const avatarHash = '101db103245e43089b1f70fcb74f0efc';
  const avatarHashAnimated = 'a_101db103245e43089b1f70fcb74f0efc';

  beforeEach(() => {
    account = new DiscordAccount({
      accountType: 'discord',
      id: '248813886583603210',
      name: 'Tomika',
      discriminator: '4051'
    });
  });

  it('should check if an avatar is animated', () => {
    expect(account.isAvatarAnimated()).toBeFalsy();

    account.avatarHash = avatarHash;
    expect(account.isAvatarAnimated()).toBeFalsy();

    account.avatarHash = avatarHashAnimated;
    expect(account.isAvatarAnimated()).toBeTruthy();
  });

  it('should get the file extension for a non-animated avatar', () => {
    account.avatarHash = avatarHash;

    expect(account['getAvatarExtension']()).toBe('png');
    expect(account['getAvatarExtension']('jpg')).toBe('jpg');
    expect(account['getAvatarExtension']('gif')).toBe('png');
  });

  it('should get the file extension for an animated avatar', () => {
    account.avatarHash = avatarHashAnimated;

    expect(account['getAvatarExtension']()).toBe('gif');
    expect(account['getAvatarExtension']('gif', true)).toBe('gif');
    expect(account['getAvatarExtension']('png', true)).toBe('gif');
    expect(account['getAvatarExtension']('gif', false)).toBe('png');
  });

  it('should get the URL of the default avatar', () => {
    expect(account.getAvatarUrl({ extension: 'jpg', size: 32 })).toBe('https://cdn.discordapp.com/embed/avatars/1.png');

    account.discriminator = '8008';
    expect(account.getAvatarUrl({ extension: 'jpg', size: 32 })).toBe('https://cdn.discordapp.com/embed/avatars/3.png');
  });

  it('should get the URL of the user\'s avatar', () => {
    account.avatarHash = avatarHash;
    expect(account.getAvatarUrl()).toBe('https://cdn.discordapp.com/avatars/248813886583603210/101db103245e43089b1f70fcb74f0efc.png?size=4096');

    account.avatarHash = avatarHashAnimated;
    expect(account.getAvatarUrl({ size: 32 })).toBe('https://cdn.discordapp.com/avatars/248813886583603210/a_101db103245e43089b1f70fcb74f0efc.gif?size=32');
  });
});
