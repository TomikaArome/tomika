import { Permission } from './permission.model';

export interface GroupModel {
  id: number;
  name: string;
  permissionIds?: number[];
}

export class Group implements GroupModel {
  private static groups: { [index: number]: Group } = {};

  id: number;
  name: string;
  permissionIds: number[];

  constructor(model: GroupModel) {
    if (Group.groups[model.id]) {
      return Group.groups[model.id];
    }

    this.id = model.id;
    this.name = model.name;
    this.permissionIds = model.permissionIds ?? [];

    Group.groups[model.id] = this;
  }

  get permissions(): Permission[] {
    return Permission.getPermissionArrayFromIdArray(this.permissionIds);
  }

  hasPermission(permission: Permission): boolean {
    return Permission.hasPermission(permission, this.permissions);
  }

  static getById(id: number): Group {
    return Group.groups[id] ?? null;
  }

  static createGroups(modelArray: GroupModel[]) {
    modelArray.forEach((model) => {
      new Group(model);
    });
  }

  static getGroupArrayFromIdArray(groupIds: number[]): Group[] {
    return groupIds.map(Group.getById).filter(groupObject => groupObject !== null);
  }
}
