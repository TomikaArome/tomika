import { PermissionHelper } from './permission.model';
import { Group } from './group.model';
import { ConnectedAccountModel, ConnectedAccount, createConnectedAccountInstance } from './connected-account/module';

export interface UserModel {
  id: number;
  permissions?: string[];
  groupIds?: number[];
  primaryAccountIndex?: number;
  connectedAccountInformation: ConnectedAccountModel[];
}

export class User implements UserModel {
  id: number;
  permissions: string[];
  groupIds: number[];
  primaryAccountIndex: number;
  connectedAccountInformation: ConnectedAccount[];

  constructor(model: UserModel) {
    this.id = model.id;
    this.permissions = model.permissions ?? [];
    this.groupIds = model.groupIds ?? [];
    this.primaryAccountIndex = model.primaryAccountIndex ?? 0;
    this.connectedAccountInformation = model.connectedAccountInformation.map(createConnectedAccountInstance);
  }

  get primaryAccount(): ConnectedAccountModel {
    return this.connectedAccountInformation[this.primaryAccountIndex] ?? null;
  }

  get connectedId() {
    return this.primaryAccount.id;
  }

  get name(): string {
    return this.primaryAccount.name;
  }

  get groups(): Group[] {
    return Group.getGroupArrayFromIdArray(this.groupIds);
  }

  hasPermission(permission: string): boolean {
    let hasPermission = PermissionHelper.hasPermission(this.permissions, permission);
    for (let i = 0; !hasPermission && i < this.groupIds.length; i++) {
      hasPermission = Group.getById(this.groupIds[i]).hasPermission(permission);
    }
    return hasPermission;
  }
}
