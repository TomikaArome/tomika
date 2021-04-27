import { Group } from './group.model';

describe('Group', () => {
  const group1Model = {
    id: 0,
    name: 'Admin'
  };
  const group2Model = {
    id: 1,
    name: 'Member',
    permissionIds: [0, 1]
  };
  let group1, group2;

  beforeEach(() => {
    group1 = new Group(group1Model);
    group2 = new Group(group2Model);
  });

  it('should set the correct values', () => {
    expect(group1.id).toBe(group1Model.id);
    expect(group1.name).toBe(group1Model.name);
    expect(group1.permissionIds).toStrictEqual([]);
    expect(group2.permissionIds).toBe(group2Model.permissionIds);
  });
});
