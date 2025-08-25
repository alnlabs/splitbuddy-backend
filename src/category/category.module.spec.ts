import { CategoryModule } from './category.module';

describe('CategoryModule', () => {
  it('should be defined', () => {
    expect(CategoryModule).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof CategoryModule).toBe('function');
  });

  it('should have the correct name', () => {
    expect(CategoryModule.name).toBe('CategoryModule');
  });
});
