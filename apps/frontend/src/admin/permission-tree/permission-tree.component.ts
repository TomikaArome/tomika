import { Component } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Permission } from '@TomikaArome/common';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { permissionTreeMock } from '../../../../../libs/common/src/mock/user/permission.mock';

const TREE_DATA = permissionTreeMock;

interface FlatPermissionNode {
  expandable: boolean;
  level: number;
  permission: Permission;
  label: string;
}

@Component({
  selector: 'tmk-permission-tree',
  templateUrl: './permission-tree.component.html',
  styleUrls: ['./permission-tree.component.scss']
})
export class PermissionTreeComponent {
  treeControl: FlatTreeControl<FlatPermissionNode>;
  treeFlattener: MatTreeFlattener<Permission, FlatPermissionNode>;
  dataSource: MatTreeFlatDataSource<Permission, FlatPermissionNode>;

  constructor() {
    this.treeControl = new FlatTreeControl<FlatPermissionNode>(node => node.level, node => node.expandable);
    this.treeFlattener = new MatTreeFlattener<Permission, FlatPermissionNode>(
      this.flattenNode,
      node => node.level,
      node => node.expandable,
      permission => permission.children);
    this.dataSource = new MatTreeFlatDataSource<Permission, FlatPermissionNode>(this.treeControl, this.treeFlattener);
    this.dataSource.data = [TREE_DATA];
    this.treeControl.expand(this.treeControl.dataNodes[0]);
  }

  flattenNode = (node: Permission, level: number): FlatPermissionNode => {
    return {
      expandable: !!node.children && node.children.length > 0,
      permission: node,
      level: level,
      get label() { return node.label; }
    }
  }

  showExpandButton(node: FlatPermissionNode): boolean {
    return node.expandable && node.permission !== TREE_DATA;
  }

  nodeIndent(node: FlatPermissionNode) {
    return `calc(${Math.max(0, node.level - 1) * 24 + (node.expandable ? 0 : 28)}px + 1em)`;
  }
}
