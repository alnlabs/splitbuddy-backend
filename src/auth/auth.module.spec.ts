import { AuthModule } from './auth.module';

describe('AuthModule', () => {
  it('should be defined', () => {
    expect(AuthModule).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof AuthModule).toBe('function');
  });

  it('should have the correct name', () => {
    expect(AuthModule.name).toBe('AuthModule');
  });
});
