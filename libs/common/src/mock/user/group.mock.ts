export const adminGroupMock = {
  id: 0,
  name: 'Admin',
  permissionIds: [0],
};

export const group1Mock = {
  id: 1,
  name: 'Member',
  permissionIds: [6, 7],
};

export const group2Mock = {
  id: 2,
  name: 'Guest',
  permissionIds: [3, 10, 12, 13],
};

export const groupWithNoPermissionsMock = {
  id: 3,
  name: 'No Permissions',
};

export const groupsArrayMock = [
  adminGroupMock,
  group1Mock,
  group2Mock,
  groupWithNoPermissionsMock,
];
