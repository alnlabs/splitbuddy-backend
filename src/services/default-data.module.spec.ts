import { DefaultDataModule } from './default-data.module';

describe('DefaultDataModule', () => {
  it('should be defined', () => {
    expect(DefaultDataModule).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof DefaultDataModule).toBe('function');
  });

  it('should have the correct name', () => {
    expect(DefaultDataModule.name).toBe('DefaultDataModule');
  });
});
