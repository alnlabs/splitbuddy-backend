import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
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

  const mockGroupRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockGroupMemberRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockExpenseRepo = {
    find: jest.fn(),
    delete: jest.fn(),
  };

  const mockExpenseSplitRepo = {
    find: jest.fn(),
    delete: jest.fn(),
  };

  const mockDataSource = {
    createQueryBuilder: jest.fn(),
    createQueryRunner: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: 'UserGroupRepository',
          useValue: mockGroupRepo,
        },
        {
          provide: 'UserGroupMemberRepository',
          useValue: mockGroupMemberRepo,
        },
        {
          provide: 'ExpenseRepository',
          useValue: mockExpenseRepo,
        },
        {
          provide: 'ExpenseSplitRepository',
          useValue: mockExpenseSplitRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
    groupRepo = module.get('UserGroupRepository');
    groupMemberRepo = module.get('UserGroupMemberRepository');
    expenseRepo = module.get('ExpenseRepository');
    expenseSplitRepo = module.get('ExpenseSplitRepository');
    dataSource = module.get<DataSource>(DataSource);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a group without members', async () => {
      const dto = {
        groupName: 'Test Group',
        description: 'Test Description',
        currency: 'USD',
        authorId: 'user-123',
        isShared: false,
      };

      const mockGroup = { id: 'group-123', ...dto };
      mockGroupRepo.create.mockReturnValue(mockGroup);
      mockGroupRepo.save.mockResolvedValue(mockGroup);
      mockGroupRepo.findOne.mockResolvedValue({ ...mockGroup, members: [] });

      // Mock the query builder for getById calls
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      };
      mockDataSource.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockGroupMemberRepo.find.mockResolvedValue([]);

      const result = await service.create(dto);

      expect(mockGroupRepo.create).toHaveBeenCalledWith(dto);
      expect(mockGroupRepo.save).toHaveBeenCalledWith(mockGroup);
      expect(result).toEqual({ ...mockGroup, members: [] });
    });

    it('should create a shared group with members', async () => {
      const dto = {
        groupName: 'Shared Group',
        description: 'Shared Description',
        currency: 'EUR',
        authorId: 'user-123',
        isShared: true,
        members: [
          { email: 'user1@test.com', fullName: 'User One' },
          { email: 'user2@test.com', fullName: 'User Two' },
        ],
      };

      const mockGroup = { id: 'group-123', ...dto };
      const mockMembers = [
        {
          id: 'member-1',
          groupId: 'group-123',
          email: 'user1@test.com',
          fullName: 'User One',
          status: 'INVITED',
          isRegistered: false,
        },
        {
          id: 'member-2',
          groupId: 'group-123',
          email: 'user2@test.com',
          fullName: 'User Two',
          status: 'INVITED',
          isRegistered: false,
        },
      ];

      mockGroupRepo.create.mockReturnValue(mockGroup);
      mockGroupRepo.save.mockResolvedValue(mockGroup);
      mockGroupRepo.findOne.mockResolvedValue({
        ...mockGroup,
        members: mockMembers,
      });
      mockGroupMemberRepo.create.mockImplementation((data) => data);
      mockGroupMemberRepo.save.mockImplementation((member) =>
        Promise.resolve(member),
      );
      mockGroupMemberRepo.find.mockResolvedValue([]);

      // Mock the query builder for getById calls
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      };
      mockDataSource.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockGroupMemberRepo.find.mockResolvedValue(mockMembers);

      const result = await service.create(dto);

      expect(mockGroupRepo.create).toHaveBeenCalledWith(dto);
      expect(mockGroupRepo.save).toHaveBeenCalledWith(mockGroup);
      expect(mockGroupMemberRepo.create).toHaveBeenCalledTimes(2);
      expect(mockGroupMemberRepo.save).toHaveBeenCalledTimes(2);
    });

    it('should create an unshared group with registered members only', async () => {
      const dto = {
        groupName: 'Personal Group',
        description: 'Personal Description',
        currency: 'USD',
        authorId: 'user-123',
        isShared: false,
        members: [
          { email: 'registered@test.com', fullName: 'Registered User' },
          { email: 'unregistered@test.com', fullName: 'Unregistered User' },
        ],
      };

      const mockGroup = { id: 'group-123', ...dto };
      const mockRegisteredUser = {
        id: 'user-456',
        email: 'registered@test.com',
      };

      mockGroupRepo.create.mockReturnValue(mockGroup);
      mockGroupRepo.save.mockResolvedValue(mockGroup);
      mockGroupRepo.findOne.mockResolvedValue({ ...mockGroup, members: [] });

      // Mock the query builder for checking registered users and getById calls
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest
          .fn()
          .mockResolvedValueOnce(mockRegisteredUser) // registered user
          .mockResolvedValueOnce(null) // unregistered user
          .mockResolvedValue(null), // for getById calls
      };
      mockDataSource.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      mockGroupMemberRepo.create.mockImplementation((data) => data);
      mockGroupMemberRepo.save.mockImplementation((member) =>
        Promise.resolve(member),
      );

      const result = await service.create(dto);

      expect(mockGroupRepo.create).toHaveBeenCalledWith(dto);
      expect(mockGroupRepo.save).toHaveBeenCalledWith(mockGroup);
      // Should only create member for registered user
      expect(mockGroupMemberRepo.create).toHaveBeenCalledTimes(1);
      expect(mockGroupMemberRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('getById', () => {
    it('should return null for non-existent group', async () => {
      mockGroupRepo.findOne.mockResolvedValue(null);

      const result = await service.getById('non-existent');

      expect(result).toBeNull();
    });

    it('should return shared group with members', async () => {
      const mockGroup = {
        id: 'group-123',
        groupName: 'Shared Group',
        isShared: true,
        authorId: 'user-123',
        createdAt: new Date(),
      };

      const mockMembers = [
        {
          id: 'member-1',
          groupId: 'group-123',
          email: 'user1@test.com',
          fullName: 'User One',
          status: 'ACCEPTED',
          isRegistered: true,
          invitedAt: undefined,
          acceptedAt: undefined,
          userId: undefined,
        },
      ];

      mockGroupRepo.findOne.mockResolvedValue(mockGroup);
      mockGroupMemberRepo.find.mockResolvedValue(mockMembers);

      const result = await service.getById('group-123');

      expect(result).toEqual({
        ...mockGroup,
        members: mockMembers.map((member) => ({
          id: member.id,
          groupId: member.groupId,
          userId: member.userId,
          email: member.email,
          fullName: member.fullName,
          status: member.status,
          invitedAt: member.invitedAt,
          acceptedAt: member.acceptedAt,
          registered: member.isRegistered,
        })),
      });
    });

    it('should return unshared group with owner and additional members', async () => {
      const mockGroup = {
        id: 'group-123',
        groupName: 'Personal Group',
        isShared: false,
        authorId: 'user-123',
        createdAt: new Date(),
      };

      const mockOwner = {
        id: 'user-123',
        email: 'owner@test.com',
        first_name: 'John',
        last_name: 'Doe',
      };

      const mockAdditionalMembers = [
        {
          id: 'member-1',
          groupId: 'group-123',
          email: 'member@test.com',
          fullName: 'Member User',
          status: 'ACCEPTED',
          isRegistered: true,
          invitedAt: undefined,
          acceptedAt: undefined,
          userId: undefined,
        },
      ];

      mockGroupRepo.findOne.mockResolvedValue(mockGroup);
      mockGroupMemberRepo.find.mockResolvedValue(mockAdditionalMembers);

      // Mock the query builder for getting owner info
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockOwner),
      };
      mockDataSource.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getById('group-123');

      expect(result).not.toBeNull();
      expect(result!.members).toHaveLength(2);
      expect(result!.members[0]).toEqual({
        id: 'owner-group-123',
        groupId: 'group-123',
        userId: 'user-123',
        email: 'owner@test.com',
        fullName: 'John Doe',
        status: 'ACCEPTED',
        invitedAt: mockGroup.createdAt,
        acceptedAt: mockGroup.createdAt,
        registered: true,
      });
    });
  });

  describe('list', () => {
    it('should return all groups with members', async () => {
      const mockGroups = [
        {
          id: 'group-1',
          groupName: 'Group One',
          isShared: true,
          authorId: 'user-123',
          createdAt: new Date(),
        },
        {
          id: 'group-2',
          groupName: 'Group Two',
          isShared: false,
          authorId: 'user-456',
          createdAt: new Date(),
        },
      ];

      const mockMembers = [
        {
          id: 'member-1',
          groupId: 'group-1',
          email: 'user1@test.com',
          fullName: 'User One',
          status: 'ACCEPTED',
          isRegistered: true,
        },
      ];

      const mockOwner = {
        id: 'user-456',
        email: 'owner@test.com',
        first_name: 'Jane',
        last_name: 'Doe',
      };

      mockGroupRepo.find.mockResolvedValue(mockGroups);
      mockGroupMemberRepo.find
        .mockResolvedValueOnce(mockMembers) // for group-1
        .mockResolvedValueOnce([]); // for group-2

      // Mock the query builder for getting owner info
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockOwner),
      };
      mockDataSource.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.list();

      expect(result).toHaveLength(2);
      expect(result[0].members).toHaveLength(1);
      expect(result[1].members).toHaveLength(1); // owner only
    });
  });

  describe('update', () => {
    it('should update group and return updated group', async () => {
      const groupId = 'group-123';
      const updateDto = { groupName: 'Updated Group Name' };
      const updatedGroup = { id: groupId, ...updateDto };

      mockGroupRepo.update.mockResolvedValue({ affected: 1 });
      mockGroupRepo.findOne.mockResolvedValue(updatedGroup);

      // Mock the query builder for getById calls
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      };
      mockDataSource.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockGroupMemberRepo.find.mockResolvedValue([]);

      const result = await service.update(groupId, updateDto);

      expect(mockGroupRepo.update).toHaveBeenCalledWith(groupId, updateDto);
      expect(result).toEqual({ ...updatedGroup, members: [] });
    });
  });

  describe('addMember', () => {
    it('should add member to shared group', async () => {
      const groupId = 'group-123';
      const memberData = {
        email: 'newmember@test.com',
        fullName: 'New Member',
      };

      const mockGroup = { id: groupId, isShared: true };
      const mockMember = {
        id: 'member-123',
        groupId,
        ...memberData,
        status: 'INVITED',
        isRegistered: false,
      };

      mockGroupRepo.findOne.mockResolvedValue(mockGroup);
      mockGroupMemberRepo.create.mockReturnValue(mockMember);
      mockGroupMemberRepo.save.mockResolvedValue(mockMember);

      const result = await service.addMember(groupId, memberData);

      expect(mockGroupRepo.findOne).toHaveBeenCalledWith({
        where: { id: groupId },
      });
      expect(mockGroupMemberRepo.create).toHaveBeenCalledWith({
        groupId,
        email: memberData.email,
        fullName: memberData.fullName,
        userId: undefined,
        status: 'INVITED',
        isRegistered: false,
        invitedAt: expect.any(Date),
      });
      expect(result).toEqual(mockMember);
    });

    it('should add registered member to unshared group', async () => {
      const groupId = 'group-123';
      const memberData = {
        email: 'registered@test.com',
        fullName: 'Registered Member',
      };

      const mockGroup = { id: groupId, isShared: false };
      const mockRegisteredUser = {
        id: 'user-456',
        email: 'registered@test.com',
      };
      const mockMember = {
        id: 'member-123',
        groupId,
        ...memberData,
        userId: 'user-456',
        status: 'ACCEPTED',
        isRegistered: true,
      };

      mockGroupRepo.findOne.mockResolvedValue(mockGroup);
      mockGroupMemberRepo.create.mockReturnValue(mockMember);
      mockGroupMemberRepo.save.mockResolvedValue(mockMember);

      // Mock the query builder for checking registered users
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockRegisteredUser),
      };
      mockDataSource.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.addMember(groupId, memberData);

      expect(mockGroupMemberRepo.create).toHaveBeenCalledWith({
        groupId,
        email: memberData.email,
        fullName: memberData.fullName,
        userId: 'user-456',
        status: 'ACCEPTED',
        isRegistered: true,
        invitedAt: expect.any(Date),
      });
      expect(result).toEqual(mockMember);
    });

    it('should throw error when adding unregistered user to unshared group', async () => {
      const groupId = 'group-123';
      const memberData = {
        email: 'unregistered@test.com',
        fullName: 'Unregistered Member',
      };

      const mockGroup = { id: groupId, isShared: false };

      mockGroupRepo.findOne.mockResolvedValue(mockGroup);

      // Mock the query builder for checking registered users
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      };
      mockDataSource.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.addMember(groupId, memberData)).rejects.toThrow(
        'Cannot add unregistered users to unshared groups',
      );
    });

    it('should throw error when group not found', async () => {
      const groupId = 'non-existent';
      const memberData = { email: 'test@test.com', fullName: 'Test' };

      mockGroupRepo.findOne.mockResolvedValue(null);

      await expect(service.addMember(groupId, memberData)).rejects.toThrow(
        'Group not found',
      );
    });
  });

  describe('updateMember', () => {
    it('should update member successfully', async () => {
      const memberId = 'member-123';
      const memberData = { status: 'ACCEPTED' };
      const mockMember = { id: memberId, ...memberData };

      mockGroupMemberRepo.findOne.mockResolvedValue(mockMember);
      mockGroupMemberRepo.update.mockResolvedValue({ affected: 1 });
      mockGroupMemberRepo.findOne.mockResolvedValue(mockMember);

      const result = await service.updateMember(memberId, memberData);

      expect(mockGroupMemberRepo.findOne).toHaveBeenCalledWith({
        where: { id: memberId },
      });
      expect(mockGroupMemberRepo.update).toHaveBeenCalledWith(
        memberId,
        memberData,
      );
      expect(result).toEqual(mockMember);
    });

    it('should throw error when member not found', async () => {
      const memberId = 'non-existent';
      const memberData = { status: 'ACCEPTED' };

      mockGroupMemberRepo.findOne.mockResolvedValue(null);

      await expect(service.updateMember(memberId, memberData)).rejects.toThrow(
        'Member not found',
      );
    });
  });

  describe('removeMember', () => {
    it('should remove member successfully', async () => {
      const memberId = 'member-123';
      const mockMember = {
        id: memberId,
        groupId: 'group-123',
        userId: 'user-456',
      };
      const mockGroup = {
        id: 'group-123',
        isShared: true,
        authorId: 'user-123',
      };

      mockGroupMemberRepo.findOne.mockResolvedValue(mockMember);
      mockGroupRepo.findOne.mockResolvedValue(mockGroup);
      mockGroupMemberRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.removeMember(memberId);

      expect(mockGroupMemberRepo.findOne).toHaveBeenCalledWith({
        where: { id: memberId },
      });
      expect(mockGroupMemberRepo.delete).toHaveBeenCalledWith(memberId);
      expect(result).toEqual({
        success: true,
        message: 'Member removed successfully',
      });
    });

    it('should throw error when trying to remove group owner from unshared group', async () => {
      const memberId = 'member-123';
      const mockMember = {
        id: memberId,
        groupId: 'group-123',
        userId: 'user-123',
      };
      const mockGroup = {
        id: 'group-123',
        isShared: false,
        authorId: 'user-123',
      };

      mockGroupMemberRepo.findOne.mockResolvedValue(mockMember);
      mockGroupRepo.findOne.mockResolvedValue(mockGroup);

      await expect(service.removeMember(memberId)).rejects.toThrow(
        'Cannot remove the group owner from unshared groups',
      );
    });

    it('should throw error when member not found', async () => {
      const memberId = 'non-existent';

      mockGroupMemberRepo.findOne.mockResolvedValue(null);

      await expect(service.removeMember(memberId)).rejects.toThrow(
        'Member not found',
      );
    });
  });

  describe('getMembers', () => {
    it('should return members for shared group', async () => {
      const groupId = 'group-123';
      const mockGroup = { id: groupId, isShared: true };
      const mockMembers = [
        {
          id: 'member-1',
          groupId,
          email: 'user1@test.com',
          fullName: 'User One',
          status: 'ACCEPTED',
          isRegistered: true,
          invitedAt: undefined,
          acceptedAt: undefined,
          userId: undefined,
        },
      ];

      mockGroupRepo.findOne.mockResolvedValue(mockGroup);
      mockGroupMemberRepo.find.mockResolvedValue(mockMembers);

      const result = await service.getMembers(groupId);

      expect(result).toEqual(
        mockMembers.map((member) => ({
          id: member.id,
          groupId: member.groupId,
          userId: member.userId,
          email: member.email,
          fullName: member.fullName,
          status: member.status,
          invitedAt: member.invitedAt,
          acceptedAt: member.acceptedAt,
          registered: member.isRegistered,
        })),
      );
    });

    it('should return owner and additional members for unshared group', async () => {
      const groupId = 'group-123';
      const mockGroup = {
        id: groupId,
        isShared: false,
        authorId: 'user-123',
        createdAt: new Date(),
      };
      const mockOwner = {
        id: 'user-123',
        email: 'owner@test.com',
        first_name: 'John',
        last_name: 'Doe',
      };
      const mockAdditionalMembers = [
        {
          id: 'member-1',
          groupId,
          email: 'member@test.com',
          fullName: 'Member User',
          status: 'ACCEPTED',
          isRegistered: true,
          invitedAt: undefined,
          acceptedAt: undefined,
          userId: undefined,
        },
      ];

      mockGroupRepo.findOne.mockResolvedValue(mockGroup);
      mockGroupMemberRepo.find.mockResolvedValue(mockAdditionalMembers);

      // Mock the query builder for getting owner info
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockOwner),
      };
      mockDataSource.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getMembers(groupId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'owner-group-123',
        groupId: 'group-123',
        userId: 'user-123',
        email: 'owner@test.com',
        fullName: 'John Doe',
        status: 'ACCEPTED',
        invitedAt: mockGroup.createdAt,
        acceptedAt: mockGroup.createdAt,
        registered: true,
        isOwner: true,
      });
      expect(result[1]).toEqual({
        id: mockAdditionalMembers[0].id,
        groupId: mockAdditionalMembers[0].groupId,
        userId: mockAdditionalMembers[0].userId,
        email: mockAdditionalMembers[0].email,
        fullName: mockAdditionalMembers[0].fullName,
        status: mockAdditionalMembers[0].status,
        invitedAt: mockAdditionalMembers[0].invitedAt,
        acceptedAt: mockAdditionalMembers[0].acceptedAt,
        registered: true,
        isOwner: false,
      });
    });

    it('should throw error when group not found', async () => {
      const groupId = 'non-existent';

      mockGroupRepo.findOne.mockResolvedValue(null);

      await expect(service.getMembers(groupId)).rejects.toThrow(
        'Group not found',
      );
    });
  });

  describe('delete', () => {
    it('should delete group and all related data successfully', async () => {
      const groupId = 'test-group-id';
      const mockExpenses = [
        { id: 'expense-1', groupId },
        { id: 'expense-2', groupId },
      ];

      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          find: jest.fn().mockResolvedValue(mockExpenses),
          delete: jest.fn().mockResolvedValue({ affected: 1 }),
        },
      };

      mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner as any);

      const result = await service.delete(groupId);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();

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

      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          find: jest.fn().mockResolvedValue([]),
          delete: jest.fn().mockResolvedValue({ affected: 0 }),
        },
      };

      mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner as any);

      const result = await service.delete(groupId);

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

    it('should handle transaction rollback on error', async () => {
      const groupId = 'test-group-id';
      const mockError = new Error('Database error');

      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          find: jest.fn().mockRejectedValue(mockError),
          delete: jest.fn(),
        },
      };

      mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner as any);

      await expect(service.delete(groupId)).rejects.toThrow('Database error');

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });
});
