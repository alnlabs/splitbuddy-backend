import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { GroupService } from './group.service';
import { UserGroup } from '../entities/user-group.entity';
import { UserGroupMember } from '../entities/user-group-member.entity';
import { Expense } from '../entities/expense.entity';
import { ExpenseSplit } from '../entities/expense-split.entity';

describe('GroupService', () => {
  let service: GroupService;
  let groupRepo: Repository<UserGroup>;
  let groupMemberRepo: Repository<UserGroupMember>;
  let expenseRepo: Repository<Expense>;
  let expenseSplitRepo: Repository<ExpenseSplit>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: getRepositoryToken(UserGroup),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserGroupMember),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Expense),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ExpenseSplit),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryBuilder: jest.fn(),
            query: jest.fn(),
            createQueryRunner: jest.fn().mockReturnValue({
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
            }),
          },
        },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
    groupRepo = module.get<Repository<UserGroup>>(
      getRepositoryToken(UserGroup),
    );
    groupMemberRepo = module.get<Repository<UserGroupMember>>(
      getRepositoryToken(UserGroupMember),
    );
    expenseRepo = module.get<Repository<Expense>>(getRepositoryToken(Expense));
    expenseSplitRepo = module.get<Repository<ExpenseSplit>>(
      getRepositoryToken(ExpenseSplit),
    );
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

      // Check the response format (with global response middleware)
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
