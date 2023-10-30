import { PermissionHelper } from './permission.model';

export interface GroupModel {
  id: number;
  name: string;
  permissions?: string[];
}

export class Group implements GroupModel {
  private static groups: { [index: number]: Group } = {};

  id!: number;
  name!: string;
  permissions!: string[];

  constructor(model: GroupModel) {
    if (Group.groups[model.id]) {
      return Group.groups[model.id];
    }

    this.id = model.id;
    this.name = model.name;
    this.permissions = model.permissions ?? [];

    Group.groups[model.id] = this;
  }

  hasPermission(permission: string): boolean {
    return PermissionHelper.hasPermission(this.permissions, permission);
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
    return groupIds
      .map(Group.getById)
      .filter((groupObject) => groupObject !== null);
  }
}
