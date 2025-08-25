import { GroupModule } from './group.module';

describe('GroupModule', () => {
  it('should be defined', () => {
    expect(GroupModule).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof GroupModule).toBe('function');
  });

  it('should have the correct name', () => {
    expect(GroupModule.name).toBe('GroupModule');
  });
});
