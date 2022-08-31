export interface Permission {
  label: string;
  description?: string;
  children?: Permission[];
}

interface PermissionArray {
  [index: string]: Permission;
}

export class PermissionHelper {
  private _rootPermission: Permission = null;
  private savedPermissions: PermissionArray = {};

  get rootPermission(): Permission {
    return this._rootPermission;
  }
  set rootPermission(rootPermission: Permission) {
    this._rootPermission = rootPermission;
    this.savedPermissions = {};
    this.savePermission(rootPermission);
  }

  private savePermission(permission: Permission, baseLabel = '') {
    const fullLabel = baseLabel + permission.label;
    this.savedPermissions[fullLabel] = permission;
    if (permission.children) {
      permission.children = permission.children.sort((a, b) =>
        a.label.localeCompare(b.label)
      );
      permission.children.forEach((childPermission) => {
        this.savePermission(childPermission, fullLabel + '.');
      });
    }
  }

  getFullLabel(permission: Permission): string {
    return Object.entries(this.savedPermissions).find(
      (entry) => entry[1] === permission
    )[0];
  }

  getPermission(fullLabel: string): Permission {
    return this.savedPermissions[fullLabel] ?? null;
  }

  getParentPermission(permission: Permission): Permission {
    return permission === this.rootPermission
      ? null
      : this.getPermission(
          this.getFullLabel(permission).replace(/\.[a-z0-9-]+$/, '')
        );
  }

  getPermissionsArray(fullLabelsArray: string[]): Permission[] {
    return fullLabelsArray
      .map((fullLabel) => this.getPermission(fullLabel))
      .filter((permission) => permission !== null);
  }

  static isAncestorOf(
    presumedAncestorLabel: string,
    presumedDescendantLabel: string
  ): boolean {
    return new RegExp(`^${presumedAncestorLabel}\\.`).test(
      presumedDescendantLabel
    );
  }

  static containsAncestor(
    fullLabelsArray: string[],
    fullLabel: string
  ): boolean {
    return fullLabelsArray.reduce(
      (isAncestor, label) =>
        isAncestor || PermissionHelper.isAncestorOf(label, fullLabel),
      false
    );
  }

  static simplifyFullLabelsArray(permissionsArray: string[]): string[] {
    return permissionsArray.sort().reduce((savedLabels, fullLabel) => {
      if (!PermissionHelper.containsAncestor(savedLabels, fullLabel)) {
        savedLabels.push(fullLabel);
      }
      return savedLabels;
    }, []);
  }

  static hasPermission(
    grantedPermissions: string[],
    fullLabel: string
  ): boolean {
    return (
      grantedPermissions.includes(fullLabel) ||
      PermissionHelper.containsAncestor(grantedPermissions, fullLabel)
    );
  }
}
