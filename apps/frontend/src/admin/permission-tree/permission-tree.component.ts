import { AfterViewInit, Component } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Permission } from '@TomikaArome/common';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { permissionTreeMock } from '../../../../../libs/common/src/mock/user/permission.mock';

const TREE_DATA = permissionTreeMock;

@Component({
  selector: 'tmk-permission-tree',
  templateUrl: './permission-tree.component.html',
  styleUrls: ['./permission-tree.component.scss']
})
export class PermissionTreeComponent {
  treeControl = new NestedTreeControl<Permission>(permission => permission.children);
  dataSource = new MatTreeNestedDataSource<Permission>();

  constructor() {
    this.dataSource.data = [TREE_DATA];
    this.treeControl.expand(TREE_DATA);
  }

  permissionHasChildren = (_: number, permission: Permission): boolean => {
    return !!permission.children && permission.children.length > 0;
  }

  isRootPermission(permission: Permission): boolean {
    return permission === TREE_DATA;
  }
}
