import { LoanModule } from './loan.module';

describe('LoanModule', () => {
  it('should be defined', () => {
    expect(LoanModule).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof LoanModule).toBe('function');
  });

  it('should have the correct name', () => {
    expect(LoanModule.name).toBe('LoanModule');
  });
});
