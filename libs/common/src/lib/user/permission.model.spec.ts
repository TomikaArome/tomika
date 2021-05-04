import { Permission } from './permission.model';
import { permissionTreeArrayMock } from '../../mock/user/permission.mock';

describe('Permission', () => {
  let rootPerm, permAdmin, permManageUsers, permPost;

  beforeAll(() => {
    Permission.createPermissionTree(permissionTreeArrayMock);
    rootPerm = Permission.getById(0);
    permAdmin = Permission.getById(1);
    permManageUsers = Permission.getById(2);
    permPost = Permission.getById(7);
  });

  it('should set the correct values', () => {
    expect(rootPerm.id).toBe(0);
    expect(rootPerm.label).toBe('perm');
    expect(rootPerm.parentId).toBeNull();
    expect(permAdmin.parentId).toBe(0);
  });

  it('should check if root', () => {
    expect(rootPerm.isRoot).toBeTruthy();
    expect(permAdmin.isRoot).toBeFalsy();
  });

  it('should return its parent', () => {
    expect(rootPerm.parent).toBeNull();
    expect(permAdmin.parent).toBe(rootPerm);
  });

  it('should return the full label', () => {
    const expectedLabel = `perm.admin.manage-users`;
    expect(permManageUsers.fullLabel).toBe(expectedLabel);
  });

  it('should check if is ancestor of another permission', () => {
    expect(rootPerm.isAncestorOf(permAdmin)).toBeTruthy();
    expect(permAdmin.isAncestorOf(rootPerm)).toBeFalsy();
    expect(permAdmin.isAncestorOf(permPost)).toBeFalsy();
  });

  it('should simplify an array of permissions', () => {
    const originalArray = [
      permAdmin,
      permManageUsers,
      permPost
    ];

    expect(Permission.simplifyPermissionArray(originalArray)).toEqual([
      permAdmin,
      permPost
    ]);
  });

  it('should check if a permission is granted given an array', () => {
    const permManageGroups = Permission.getById(5),
      permEditInfo = Permission.getById(3),
      permSubscribed = Permission.getById(11);
    const grantedPermissions = [
      permPost,
      permManageUsers,
      permManageGroups
    ];

    expect(Permission.hasPermission(permManageGroups, grantedPermissions)).toBeTruthy();
    expect(Permission.hasPermission(permEditInfo, grantedPermissions)).toBeTruthy();
    expect(Permission.hasPermission(permSubscribed, grantedPermissions)).toBeTruthy();
    expect(Permission.hasPermission(permAdmin, grantedPermissions)).toBeFalsy();
    expect(Permission.hasPermission(rootPerm, grantedPermissions)).toBeFalsy();
  });
});
