export interface PermissionModel {
  id: number;
  label: string;
  parentId?: number;
}

export class Permission implements PermissionModel {
  id: number;
  label: string;
  parentId: number;

  constructor(model: PermissionModel) {
    if (Permission.permissions[model.id]) {
      return Permission.permissions[model.id];
    }

    this.id = model.id;
    this.label = model.label;
    this.parentId = model.parentId ?? null;

    Permission.permissions[this.id] = this;
  }

  get isRoot(): boolean {
    return this.parentId === null;
  }

  get parent(): Permission {
    return this.isRoot ? null : Permission.permissions[this.parentId];
  }

  get fullLabel(): string {
    return (this.isRoot ? '' : (this.parent?.fullLabel + '.')) + this.label;
  }

  private static permissions: { [index: number]: Permission } = [];
}
