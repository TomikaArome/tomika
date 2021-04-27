import { Permission } from './permission.model';

describe('Permission', () => {
  const rootPermModel = {
    id: 0,
    label: 'perm'
  };
  const perm1Model = {
    id: 1,
    label: 'admin',
    parentId: 0
  };
  const perm2Model = {
    id: 2,
    label: 'power',
    parentId: 1
  };
  let rootPerm, perm1, perm2;

  beforeAll(() => {
    rootPerm = new Permission(rootPermModel);
    perm1 = new Permission(perm1Model);
    perm2 = new Permission(perm2Model);
  });

  it('should set the correct values', () => {
    expect(rootPerm.id).toBe(rootPermModel.id);
    expect(rootPerm.label).toBe(rootPermModel.label);
    expect(rootPerm.parentId).toBeNull();
    expect(perm1.parentId).toBe(perm1Model.parentId);
  });

  it('should check if root', () => {
    expect(rootPerm.isRoot).toBeTruthy();
    expect(perm1.isRoot).toBeFalsy();
  });

  it('should return its parent', () => {
    expect(rootPerm.parent).toBeNull();
    expect(perm1.parent).toBe(rootPerm);
  });

  it('should return the full label', () => {
    const expectedLabel = `${rootPermModel.label}.${perm1Model.label}.${perm2Model.label}`;
    expect(perm2.fullLabel).toBe(expectedLabel);
  });
});
