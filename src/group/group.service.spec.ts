import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

      // Mock the repository methods
      jest.spyOn(expenseRepo, 'find').mockResolvedValue(mockExpenses as any);
      jest
        .spyOn(expenseSplitRepo, 'delete')
        .mockResolvedValue({ affected: 1 } as any);
      jest
        .spyOn(expenseRepo, 'delete')
        .mockResolvedValue({ affected: 2 } as any);
      jest
        .spyOn(groupMemberRepo, 'delete')
        .mockResolvedValue({ affected: 3 } as any);
      jest.spyOn(groupRepo, 'delete').mockResolvedValue({ affected: 1 } as any);

      const result = await service.delete(groupId);

      // Verify that all related data was deleted
      expect(expenseRepo.find).toHaveBeenCalledWith({ where: { groupId } });
      expect(expenseSplitRepo.delete).toHaveBeenCalledWith({
        expenseId: 'expense-1',
      });
      expect(expenseSplitRepo.delete).toHaveBeenCalledWith({
        expenseId: 'expense-2',
      });
      expect(expenseRepo.delete).toHaveBeenCalledWith({ groupId });
      expect(groupMemberRepo.delete).toHaveBeenCalledWith({ groupId });
      expect(groupRepo.delete).toHaveBeenCalledWith(groupId);

      expect(result).toEqual({
        deleted: true,
        message:
          'Group and all related data (2 expenses, 2 expense splits, and all members) have been deleted successfully.',
      });
    });

    it('should handle group with no expenses', async () => {
      const groupId = 'test-group-id';

      jest.spyOn(expenseRepo, 'find').mockResolvedValue([]);
      jest
        .spyOn(expenseSplitRepo, 'delete')
        .mockResolvedValue({ affected: 0 } as any);
      jest
        .spyOn(expenseRepo, 'delete')
        .mockResolvedValue({ affected: 0 } as any);
      jest
        .spyOn(groupMemberRepo, 'delete')
        .mockResolvedValue({ affected: 0 } as any);
      jest.spyOn(groupRepo, 'delete').mockResolvedValue({ affected: 1 } as any);

      const result = await service.delete(groupId);

      expect(result).toEqual({
        deleted: true,
        message:
          'Group and all related data (0 expenses, 0 expense splits, and all members) have been deleted successfully.',
      });
    });
  });
});
