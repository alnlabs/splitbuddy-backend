import { ExpenseModule } from './expense.module';

describe('ExpenseModule', () => {
  it('should be defined', () => {
    expect(ExpenseModule).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof ExpenseModule).toBe('function');
  });

  it('should have the correct name', () => {
    expect(ExpenseModule.name).toBe('ExpenseModule');
  });
});
