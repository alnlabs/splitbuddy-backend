import { Test, TestingModule } from '@nestjs/testing';
import { GroupMemberService } from './group-member.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserGroupMember } from '../entities/user-group-member.entity';
import { Repository } from 'typeorm';
import { CreateGroupMemberDto, UpdateGroupMemberDto } from './group-member.dto';

describe('GroupMemberService', () => {
  let service: GroupMemberService;
  let mockRepository: jest.Mocked<Repository<UserGroupMember>>;

  const mockGroupMember: UserGroupMember = {
    id: 'test-id-1',
    groupId: 'group-id-1',
    userId: 'user-id-1',
    email: 'test@example.com',
    fullName: 'Test User',
    status: 'ACTIVE',
    isRegistered: true,
    createdAt: new Date(),
    invitedAt: new Date(),
    acceptedAt: new Date(),
  };

  const mockGroupMember2: UserGroupMember = {
    id: 'test-id-2',
    groupId: 'group-id-1',
    userId: null,
    email: 'invited@example.com',
    fullName: 'Invited User',
    status: 'INVITED',
    isRegistered: false,
    createdAt: new Date(),
    invitedAt: new Date(),
    acceptedAt: null,
  };

  beforeEach(async () => {
    const mockRepositoryMethods = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupMemberService,
        {
          provide: getRepositoryToken(UserGroupMember),
          useValue: mockRepositoryMethods,
        },
      ],
    }).compile();

    service = module.get<GroupMemberService>(GroupMemberService);
    mockRepository = module.get(getRepositoryToken(UserGroupMember));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new group member successfully', async () => {
      const createDto: CreateGroupMemberDto = {
        groupId: 'group-id-1',
        userId: 'user-id-1',
        email: 'test@example.com',
        fullName: 'Test User',
        status: 'ACTIVE',
        isRegistered: true,
      };

      mockRepository.create.mockReturnValue(mockGroupMember);
      mockRepository.save.mockResolvedValue(mockGroupMember);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockGroupMember);
      expect(result).toEqual(mockGroupMember);
    });

    it('should create a group member with minimal data', async () => {
      const createDto: CreateGroupMemberDto = {
        groupId: 'group-id-1',
        email: 'minimal@example.com',
      };

      const minimalMember = {
        ...mockGroupMember,
        id: 'minimal-id',
        userId: null,
        fullName: null,
        status: 'INVITED',
        isRegistered: false,
        invitedAt: null,
        acceptedAt: null,
      };

      mockRepository.create.mockReturnValue(minimalMember);
      mockRepository.save.mockResolvedValue(minimalMember);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(minimalMember);
      expect(result).toEqual(minimalMember);
    });

    it('should create a group member with invited status by default', async () => {
      const createDto: CreateGroupMemberDto = {
        groupId: 'group-id-1',
        email: 'invited@example.com',
        fullName: 'Invited User',
      };

      const invitedMember = {
        ...mockGroupMember,
        id: 'invited-id',
        userId: null,
        status: 'INVITED',
        isRegistered: false,
        invitedAt: new Date(),
        acceptedAt: null,
      };

      mockRepository.create.mockReturnValue(invitedMember);
      mockRepository.save.mockResolvedValue(invitedMember);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(invitedMember);
      expect(result).toEqual(invitedMember);
    });

    it('should handle repository save errors', async () => {
      const createDto: CreateGroupMemberDto = {
        groupId: 'group-id-1',
        email: 'error@example.com',
      };

      mockRepository.create.mockReturnValue(mockGroupMember);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow('Database error');
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockGroupMember);
    });
  });

  describe('getById', () => {
    it('should return a group member by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockGroupMember);

      const result = await service.getById('test-id-1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
      });
      expect(result).toEqual(mockGroupMember);
    });

    it('should return null when group member not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getById('non-existent-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
      expect(result).toBeNull();
    });

    it('should handle repository findOne errors', async () => {
      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.getById('test-id-1')).rejects.toThrow(
        'Database error',
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
      });
    });
  });

  describe('list', () => {
    it('should return all group members', async () => {
      const mockMembers = [mockGroupMember, mockGroupMember2];
      mockRepository.find.mockResolvedValue(mockMembers);

      const result = await service.list();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockMembers);
    });

    it('should return empty array when no group members exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.list();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle repository find errors', async () => {
      mockRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.list()).rejects.toThrow('Database error');
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a group member successfully', async () => {
      const updateDto: UpdateGroupMemberDto = {
        status: 'ACTIVE',
        isRegistered: true,
        acceptedAt: new Date(),
      };

      const updatedMember = {
        ...mockGroupMember,
        ...updateDto,
      };

      mockRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockRepository.findOne.mockResolvedValue(updatedMember);

      const result = await service.update('test-id-1', updateDto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        'test-id-1',
        updateDto,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
      });
      expect(result).toEqual(updatedMember);
    });

    it('should handle partial updates', async () => {
      const updateDto: UpdateGroupMemberDto = {
        fullName: 'Updated Name',
      };

      const updatedMember = {
        ...mockGroupMember,
        fullName: 'Updated Name',
      };

      mockRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockRepository.findOne.mockResolvedValue(updatedMember);

      const result = await service.update('test-id-1', updateDto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        'test-id-1',
        updateDto,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
      });
      expect(result).toEqual(updatedMember);
    });

    it('should handle status transitions', async () => {
      const updateDto: UpdateGroupMemberDto = {
        status: 'ACTIVE',
        acceptedAt: new Date(),
      };

      const updatedMember = {
        ...mockGroupMember2,
        status: 'ACTIVE',
        acceptedAt: new Date(),
      };

      mockRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockRepository.findOne.mockResolvedValue(updatedMember);

      const result = await service.update('test-id-2', updateDto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        'test-id-2',
        updateDto,
      );
      expect(result).toEqual(updatedMember);
    });

    it('should return null when updating non-existent member', async () => {
      const updateDto: UpdateGroupMemberDto = { status: 'ACTIVE' };

      mockRepository.update.mockResolvedValue({ affected: 0 } as any);
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.update('non-existent-id', updateDto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        'non-existent-id',
        updateDto,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
      expect(result).toBeNull();
    });

    it('should handle repository update errors', async () => {
      const updateDto: UpdateGroupMemberDto = { status: 'ACTIVE' };

      mockRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(service.update('test-id-1', updateDto)).rejects.toThrow(
        'Database error',
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        'test-id-1',
        updateDto,
      );
    });

    it('should handle repository findOne errors after update', async () => {
      const updateDto: UpdateGroupMemberDto = { status: 'ACTIVE' };

      mockRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.update('test-id-1', updateDto)).rejects.toThrow(
        'Database error',
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        'test-id-1',
        updateDto,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
      });
    });
  });

  describe('delete', () => {
    it('should delete a group member successfully', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.delete('test-id-1');

      expect(mockRepository.delete).toHaveBeenCalledWith('test-id-1');
      expect(result).toEqual({ deleted: true });
    });

    it('should return deleted true even when member does not exist', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 } as any);

      const result = await service.delete('non-existent-id');

      expect(mockRepository.delete).toHaveBeenCalledWith('non-existent-id');
      expect(result).toEqual({ deleted: true });
    });

    it('should handle repository delete errors', async () => {
      mockRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(service.delete('test-id-1')).rejects.toThrow(
        'Database error',
      );
      expect(mockRepository.delete).toHaveBeenCalledWith('test-id-1');
    });
  });

  describe('edge cases and validation', () => {
    it('should handle empty string id in getById', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getById('');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '' },
      });
      expect(result).toBeNull();
    });

    it('should handle empty string id in update', async () => {
      const updateDto: UpdateGroupMemberDto = { status: 'ACTIVE' };

      mockRepository.update.mockResolvedValue({ affected: 0 } as any);
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.update('', updateDto);

      expect(mockRepository.update).toHaveBeenCalledWith('', updateDto);
      expect(result).toBeNull();
    });

    it('should handle empty string id in delete', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 } as any);

      const result = await service.delete('');

      expect(mockRepository.delete).toHaveBeenCalledWith('');
      expect(result).toEqual({ deleted: true });
    });

    it('should handle null/undefined dto in create', async () => {
      const nullDto = null as any;
      mockRepository.create.mockReturnValue(mockGroupMember);
      mockRepository.save.mockResolvedValue(mockGroupMember);

      const result = await service.create(nullDto);

      expect(mockRepository.create).toHaveBeenCalledWith(nullDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockGroupMember);
      expect(result).toEqual(mockGroupMember);
    });

    it('should handle null/undefined dto in update', async () => {
      const nullDto = null as any;

      mockRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockRepository.findOne.mockResolvedValue(mockGroupMember);

      const result = await service.update('test-id-1', nullDto);

      expect(mockRepository.update).toHaveBeenCalledWith('test-id-1', nullDto);
      expect(result).toEqual(mockGroupMember);
    });
  });

  describe('type safety', () => {
    it('should properly type the return values', async () => {
      mockRepository.findOne.mockResolvedValue(mockGroupMember);
      mockRepository.find.mockResolvedValue([mockGroupMember]);

      const getByIdResult = await service.getById('test-id');
      const listResult = await service.list();
      const deleteResult = await service.delete('test-id');

      expect(getByIdResult).toBeDefined();
      expect(Array.isArray(listResult)).toBe(true);
      expect(deleteResult).toHaveProperty('deleted');
      expect(typeof deleteResult.deleted).toBe('boolean');
    });
  });
});
