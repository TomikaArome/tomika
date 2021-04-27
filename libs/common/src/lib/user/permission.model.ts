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

  isAncestorOf(otherPermission: Permission): boolean {
    let isAncestor = false, checkPermission = otherPermission;
    while (!isAncestor && !checkPermission.isRoot) {
      isAncestor = checkPermission.parent === this;
      checkPermission = checkPermission.parent;
    }
    return isAncestor;
  }

  private static permissions: { [index: number]: Permission } = {};

  static buildPermissionTree(modelArray: PermissionModel[]) {
    modelArray.forEach((model) => {
      new Permission(model);
    });
  }

  static simplifyPermissionArray(permissionArray: Permission[]): Permission[] {
    return permissionArray.reduce((newArray: Permission[], permissionToAdd) => {
      let addToArray = true;
      newArray = newArray.filter((currentPermission) => {
        if (currentPermission === permissionToAdd || currentPermission.isAncestorOf(permissionToAdd)) { addToArray = false; }
        return !permissionToAdd.isAncestorOf(currentPermission);
      });
      if (addToArray) {
        newArray.push(permissionToAdd);
      }
      return newArray;
    }, []);
  }
}
