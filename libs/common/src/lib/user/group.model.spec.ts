import { Group } from './group.model';
import { adminGroupMock, groupsArrayMock } from '../../mock/module';

describe('Group', () => {
  let adminGroup;

  beforeEach(() => {
    Group.createGroups(groupsArrayMock);
    adminGroup = Group.getById(0);
  });

  it('should set the correct values', () => {
    expect(adminGroup.id).toBe(adminGroupMock.id);
    expect(adminGroup.name).toBe(adminGroupMock.name);
  });
});
