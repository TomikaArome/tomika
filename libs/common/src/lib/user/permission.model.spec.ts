import { Permission } from './permission.model';
import { rootPermMock, permAdminMock, permManageUsersMock, permPostMock } from '../../mock/user/permission.mock';

describe('Permission', () => {
  let rootPerm, permAdmin, permManageUsers, permPost;

  beforeAll(() => {
    rootPerm = new Permission(rootPermMock);
    permAdmin = new Permission(permAdminMock);
    permManageUsers = new Permission(permManageUsersMock);
    permPost = new Permission(permPostMock);
  });

  it('should set the correct values', () => {
    expect(rootPerm.id).toBe(rootPermMock.id);
    expect(rootPerm.label).toBe(rootPermMock.label);
    expect(rootPerm.parentId).toBeNull();
    expect(permAdmin.parentId).toBe(permAdminMock.parentId);
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
    const expectedLabel = `${rootPermMock.label}.${permAdminMock.label}.${permManageUsersMock.label}`;
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
});
