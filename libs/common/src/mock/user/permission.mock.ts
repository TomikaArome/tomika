export const rootPermMock = {
  id: 0,
  label: 'perm'
};

export const permAdminMock = {
  id: 1,
  label: 'admin',
  parentId: 0
};

export const permManageUsersMock = {
  id: 2,
  label: 'manage-users',
  parentId: 1
};

export const permPostMock = {
  id: 7,
  label: 'post',
  parentId: 0
};

export const permTreeArrayMock = [
  rootPermMock,
  permAdminMock,
  permManageUsersMock,
  {
    id: 3,
    label: 'edit-info',
    parentId: 2
  },
  {
    id: 4,
    label: 'ban',
    parentId: 2
  },
  {
    id: 5,
    label: 'manage-groups',
    parentId: 1
  },
  {
    id: 6,
    label: 'manage-permissions',
    parentId: 1
  },
  permPostMock,
  {
    id: 8,
    label: 'submit',
    parentId: 7
  },
  {
    id: 9,
    label: 'view',
    parentId: 7
  },
  {
    id: 10,
    label: 'general',
    parentId: 9
  },
  {
    id: 11,
    label: 'subscribed',
    parentId: 9
  },
  {
    id: 12,
    label: 'comment',
    parentId: 7
  },
  {
    id: 13,
    label: 'rate',
    parentId: 7
  }
];
