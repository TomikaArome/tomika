import { Injectable } from '@angular/core';
import { PermissionHelper, permissionTree } from '@TomikaArome/common';

@Injectable({ providedIn: 'root' })
export class PermissionService extends PermissionHelper {
  constructor() {
    super();
    this.rootPermission = permissionTree;
  }
}
