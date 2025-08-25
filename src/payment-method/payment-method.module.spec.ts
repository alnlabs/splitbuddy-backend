import { PaymentMethodModule } from './payment-method.module';

describe('PaymentMethodModule', () => {
  it('should be defined', () => {
    expect(PaymentMethodModule).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof PaymentMethodModule).toBe('function');
  });

  it('should have the correct name', () => {
    expect(PaymentMethodModule.name).toBe('PaymentMethodModule');
  });
});
