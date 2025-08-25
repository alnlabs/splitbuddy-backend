import { ExternalUserModule } from './external-user.module';

describe('ExternalUserModule', () => {
  it('should be defined', () => {
    expect(ExternalUserModule).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof ExternalUserModule).toBe('function');
  });

  it('should have the correct name', () => {
    expect(ExternalUserModule.name).toBe('ExternalUserModule');
  });
});
