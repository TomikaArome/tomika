import { ConnectedAccountModel, ConnectedAccount, ConnectedAccountAvatarOptions } from './connected-account.model';

type DiscordAccountAvatarValidExtensions = 'png' | 'jpg' | 'jpeg' | 'webp' | 'gif';
type DiscordAccountAvatarValidSizes = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;
interface DiscordAccountAvatarOptions extends ConnectedAccountAvatarOptions {
  size?: DiscordAccountAvatarValidSizes;
  extension?: DiscordAccountAvatarValidExtensions;
}

export interface DiscordAccountModel extends ConnectedAccountModel {
  readonly accountType: 'discord';
  id: string;
  discriminator: string;
  avatarHash?: string;
}

export class DiscordAccount implements DiscordAccountModel, ConnectedAccount {
  readonly accountType: 'discord';
  id: string;
  name: string;
  discriminator: string;
  avatarHash: string;

  constructor(model: DiscordAccountModel) {
    this.id = model.id;
    this.name = model.name;
    this.discriminator = model.discriminator;
    this.avatarHash = model.avatarHash ?? null;
  }

  isAvatarAnimated(): boolean {
    return /^a_/.test(this.avatarHash);
  }

  getAvatarUrl(options: DiscordAccountAvatarOptions = {}): string {
    let url = 'https://cdn.discordapp.com/';
    if (this.avatarHash) {
      url += `avatars/${this.id}/${this.avatarHash}.${this.getAvatarExtension(options.extension, options.animated)}?size=${options.size ?? 4096}`;
    } else {
      url += `embed/avatars/${parseInt(this.discriminator) % 5}.png`;
    }
    return url;
  }

  private getAvatarExtension(extension: DiscordAccountAvatarValidExtensions = 'png', animated = true): string {
    if (animated && this.isAvatarAnimated()) {
      extension = 'gif';
    } else if (extension === 'gif') {
      extension = 'png';
    }
    return extension;
  }
}
