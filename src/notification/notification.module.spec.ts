import { NotificationModule } from './notification.module';

describe('NotificationModule', () => {
  it('should be defined', () => {
    expect(NotificationModule).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof NotificationModule).toBe('function');
  });

  it('should have the correct name', () => {
    expect(NotificationModule.name).toBe('NotificationModule');
  });
});
