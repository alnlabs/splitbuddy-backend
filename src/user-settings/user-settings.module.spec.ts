import { Test, TestingModule } from '@nestjs/testing';
import { UserSettingsModule } from './user-settings.module';
import { UserSettingsController } from './user-settings.controller';
import { UserSettingsService } from './user-settings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserSettings } from '../entities/user-settings.entity';

describe('UserSettingsModule', () => {
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      imports: [UserSettingsModule],
    })
      .overrideProvider(getRepositoryToken(UserSettings))
      .useValue({
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })
      .compile();
  });

  it('should be defined', () => {
    expect(testingModule).toBeDefined();
  });

  it('should have UserSettingsController defined', () => {
    const controller = testingModule.get<UserSettingsController>(
      UserSettingsController,
    );
    expect(controller).toBeDefined();
  });

  it('should have UserSettingsService defined', () => {
    const service = testingModule.get<UserSettingsService>(UserSettingsService);
    expect(service).toBeDefined();
  });

  it('should export UserSettingsService', () => {
    const service = testingModule.get<UserSettingsService>(UserSettingsService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(UserSettingsService);
  });

  it('should have proper module structure', () => {
    const moduleMetadata = Reflect.getMetadata('imports', UserSettingsModule);
    const controllers = Reflect.getMetadata('controllers', UserSettingsModule);
    const providers = Reflect.getMetadata('providers', UserSettingsModule);
    const exports = Reflect.getMetadata('exports', UserSettingsModule);

    expect(moduleMetadata).toBeDefined();
    expect(controllers).toContain(UserSettingsController);
    expect(providers).toContain(UserSettingsService);
    expect(exports).toContain(UserSettingsService);
  });

  it('should have TypeORM feature module imported', () => {
    const moduleMetadata = Reflect.getMetadata('imports', UserSettingsModule);
    expect(moduleMetadata).toBeDefined();
    expect(moduleMetadata.length).toBeGreaterThan(0);
  });
});
