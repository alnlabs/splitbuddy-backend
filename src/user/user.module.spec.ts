import { UserModule } from './user.module';

describe('UserModule', () => {
  it('should be defined', () => {
    expect(UserModule).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof UserModule).toBe('function');
  });

  it('should have the correct name', () => {
    expect(UserModule.name).toBe('UserModule');
  });
});
