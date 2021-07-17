import { PermissionHelper } from './permission.model';
import { permissionTreeMock } from '../../mock/user/permission.mock';

describe('Permission', () => {
  let helper: PermissionHelper;

  beforeEach(() => {
    helper = new PermissionHelper();
    helper.rootPermission = permissionTreeMock;
  });

  it('should be able to get the permission object from the full label', () => {
    const editInfoPermission = helper.getPermission('perm.admin.manage-users.edit-info');
    const nonExistent = helper.getPermission('perm.this.is.nonsense');
    expect(editInfoPermission.label).toBe('edit-info');
    expect(nonExistent).toBe(null);
  });

  it('should be able to get the parent of a permission', () => {
    const editInfoPermission = helper.getPermission('perm.admin.manage-users.edit-info');
    const manageUsersPermission = helper.getPermission('perm.admin.manage-users');
    expect(helper.getParentPermission(editInfoPermission)).toBe(manageUsersPermission);
  });

  it('should be able to test if a permission is an ancestor of another permission', () => {
    const editInfoLabel = 'perm.admin.manage-users.edit-info';
    const adminLabel = 'perm.admin';
    const commentLabel = 'perm.post.comment';

    expect(PermissionHelper.isAncestorOf(adminLabel, editInfoLabel)).toBeTruthy();
    expect(PermissionHelper.isAncestorOf(editInfoLabel, adminLabel)).toBeFalsy();
    expect(PermissionHelper.isAncestorOf(editInfoLabel, editInfoLabel)).toBeFalsy();
    expect(PermissionHelper.isAncestorOf(commentLabel, editInfoLabel)).toBeFalsy();
  });

  it('should be able to simplify an array of permissions', () => {
    const originalArray = ['perm.admin.manage-users', 'perm.post', 'perm.admin'];
    expect(PermissionHelper.simplifyFullLabelsArray(originalArray)).toEqual(['perm.admin', 'perm.post']);
  });

  it('should be able to check if a permission has been granted from an array of permissions', () => {
    const editInfoLabel = 'perm.admin.manage-users.edit-info';
    const commentLabel = 'perm.post.comment';
    const rateLabel = 'perm.post.rate';
    const grantedPermissions = ['perm.admin', 'perm.post.comment'];

    expect(PermissionHelper.hasPermission(grantedPermissions, editInfoLabel)).toBeTruthy();
    expect(PermissionHelper.hasPermission(grantedPermissions, commentLabel)).toBeTruthy();
    expect(PermissionHelper.hasPermission(grantedPermissions, rateLabel)).toBeFalsy();
  });
});
