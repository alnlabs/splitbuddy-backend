import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { GroupService } from './group.service';

describe('GroupService', () => {
  let service: GroupService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: 'UserGroupRepository',
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: 'UserGroupMemberRepository',
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: 'ExpenseRepository',
          useValue: {
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: 'ExpenseSplitRepository',
          useValue: {
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('delete', () => {
    it('should delete group and all related data', async () => {
      const groupId = 'test-group-id';
      const mockExpenses = [
        { id: 'expense-1', groupId },
        { id: 'expense-2', groupId },
      ];

      // Mock the queryRunner manager methods
      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        query: jest.fn(),
        manager: {
          find: jest.fn().mockResolvedValue(mockExpenses),
          delete: jest.fn().mockResolvedValue({ affected: 1 }),
          save: jest.fn(),
        },
      };

      jest
        .spyOn(dataSource, 'createQueryRunner')
        .mockReturnValue(mockQueryRunner as any);

      const result = await service.delete(groupId);

      // Verify that the queryRunner was used correctly
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();

      // Check the response format (with global response middleware)
      expect(result).toEqual({
        success: true,
        data: {
          deleted: true,
          message:
            'Group and all related data (2 expenses, 2 expense splits, and all members) have been deleted successfully.',
        },
        message:
          'Group and all related data (2 expenses, 2 expense splits, and all members) have been deleted successfully.',
        error: null,
      });
    });

    it('should handle group with no expenses', async () => {
      const groupId = 'test-group-id';

      // Mock the queryRunner manager methods
      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        query: jest.fn(),
        manager: {
          find: jest.fn().mockResolvedValue([]),
          delete: jest.fn().mockResolvedValue({ affected: 0 }),
          save: jest.fn(),
        },
      };

      jest
        .spyOn(dataSource, 'createQueryRunner')
        .mockReturnValue(mockQueryRunner as any);

      const result = await service.delete(groupId);

      // Verify that the queryRunner was used correctly
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();

      // Check the response format for group with no expenses
      expect(result).toEqual({
        success: true,
        data: {
          deleted: true,
          message:
            'Group and all related data (0 expenses, 0 expense splits, and all members) have been deleted successfully.',
        },
        message:
          'Group and all related data (0 expenses, 0 expense splits, and all members) have been deleted successfully.',
        error: null,
      });
    });
  });
});
