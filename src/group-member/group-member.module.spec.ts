import { GroupMemberModule } from './group-member.module';

describe('GroupMemberModule', () => {
  it('should be defined', () => {
    expect(GroupMemberModule).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof GroupMemberModule).toBe('function');
  });

  it('should have the correct name', () => {
    expect(GroupMemberModule.name).toBe('GroupMemberModule');
  });
});
