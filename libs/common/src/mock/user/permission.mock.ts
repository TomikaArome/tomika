export const permissionTreeMock = {
  label: 'perm',
  children: [
    {
      label: 'admin',
      children: [
        {
          label: 'manage-users',
          children: [{ label: 'edit-info' }, { label: 'ban' }],
        },
        { label: 'manage-groups' },
        { label: 'manage-permission-tree' },
      ],
    },
    {
      label: 'post',
      children: [
        { label: 'submit' },
        {
          label: 'view',
          children: [{ label: 'general' }, { label: 'subscribed' }],
        },
        { label: 'comment' },
        { label: 'rate' },
      ],
    },
  ],
};
