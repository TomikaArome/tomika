import { DiscordAccount, DiscordAccountModel } from './discord-account.model';

export interface ConnectedAccountModel {
  readonly accountType: string;
  id;
  name: string;
}

export interface ConnectedAccount extends ConnectedAccountModel {
  getAvatarUrl: (avatarOptions: ConnectedAccountAvatarOptions) => string;
}

export interface ConnectedAccountAvatarOptions {
  size?: number;
  animated?: boolean;
  extension?: string;
}

export function createConnectedAccountInstance(
  model: ConnectedAccountModel
): ConnectedAccount {
  // More account types would involve a switch case on the accountType here
  return new DiscordAccount(model as DiscordAccountModel) as ConnectedAccount;
}
