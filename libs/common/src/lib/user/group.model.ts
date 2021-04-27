import { Permission } from './permission.model';

export interface GroupModel {
  id: number;
  name: string;
  permissionIds?: number[];
}

export class Group implements GroupModel {
  id: number;
  name: string;
  permissionIds?: number[];

  constructor(model: GroupModel) {
    this.id = model.id;
    this.name = model.name;
    this.permissionIds = model.permissionIds ?? [];
  }
}
