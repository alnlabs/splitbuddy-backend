import { PlansModule } from './plans.module';

describe('PlansModule', () => {
  it('should be defined', () => {
    expect(PlansModule).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof PlansModule).toBe('function');
  });

  it('should have the correct name', () => {
    expect(PlansModule.name).toBe('PlansModule');
  });
});
