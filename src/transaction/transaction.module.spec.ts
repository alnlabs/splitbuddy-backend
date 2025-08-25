import { TransactionModule } from './transaction.module';

describe('TransactionModule', () => {
  it('should be defined', () => {
    expect(TransactionModule).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof TransactionModule).toBe('function');
  });

  it('should have the correct name', () => {
    expect(TransactionModule.name).toBe('TransactionModule');
  });
});
