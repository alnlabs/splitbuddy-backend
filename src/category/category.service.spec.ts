import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { Repository } from 'typeorm';

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryRepo: Repository<Category>;

  const mockCategoryRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockCategory: Category = {
    id: 'test-id-1',
    name: 'Test Category',
    authorId: 'user-id-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategory2: Category = {
    id: 'test-id-2',
    name: 'Another Category',
    authorId: 'user-id-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepo,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    categoryRepo = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new category successfully', async () => {
      const createDto = { name: 'New Category', authorId: 'user-id-1' };
      const createdCategory = { ...mockCategory, ...createDto };

      mockCategoryRepo.create.mockReturnValue(createdCategory);
      mockCategoryRepo.save.mockResolvedValue(createdCategory);

      const result = await service.create(createDto);

      expect(mockCategoryRepo.create).toHaveBeenCalledWith(createDto);
      expect(mockCategoryRepo.save).toHaveBeenCalledWith(createdCategory);
      expect(result).toEqual(createdCategory);
    });

    it('should create a category without authorId', async () => {
      const createDto = { name: 'Public Category' };
      const createdCategory = { ...mockCategory, ...createDto, authorId: null };

      mockCategoryRepo.create.mockReturnValue(createdCategory);
      mockCategoryRepo.save.mockResolvedValue(createdCategory);

      const result = await service.create(createDto);

      expect(mockCategoryRepo.create).toHaveBeenCalledWith(createDto);
      expect(mockCategoryRepo.save).toHaveBeenCalledWith(createdCategory);
      expect(result).toEqual(createdCategory);
    });

    it('should handle repository save errors', async () => {
      const createDto = { name: 'Error Category' };
      const createdCategory = { ...mockCategory, ...createDto };

      mockCategoryRepo.create.mockReturnValue(createdCategory);
      mockCategoryRepo.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow('Database error');
      expect(mockCategoryRepo.create).toHaveBeenCalledWith(createDto);
      expect(mockCategoryRepo.save).toHaveBeenCalledWith(createdCategory);
    });
  });

  describe('getById', () => {
    it('should return a category when found', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);

      const result = await service.getById('test-id-1');

      expect(mockCategoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
      });
      expect(result).toEqual(mockCategory);
    });

    it('should return null when category not found', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(null);

      const result = await service.getById('non-existent-id');

      expect(mockCategoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
      expect(result).toBeNull();
    });

    it('should handle repository findOne errors', async () => {
      mockCategoryRepo.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.getById('test-id-1')).rejects.toThrow(
        'Database error',
      );
      expect(mockCategoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
      });
    });
  });

  describe('list', () => {
    it('should return user-specific categories when userId is provided', async () => {
      const userCategories = [mockCategory, mockCategory2];
      mockCategoryRepo.find.mockResolvedValue(userCategories);

      const result = await service.list('user-id-1');

      expect(mockCategoryRepo.find).toHaveBeenCalledWith({
        where: { authorId: 'user-id-1' },
        order: { name: 'ASC' },
      });
      expect(result).toEqual(userCategories);
    });

    it('should return all categories when no userId is provided', async () => {
      const allCategories = [mockCategory, mockCategory2];
      mockCategoryRepo.find.mockResolvedValue(allCategories);

      const result = await service.list();

      expect(mockCategoryRepo.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
      expect(result).toEqual(allCategories);
    });

    it('should return empty array when no categories found for user', async () => {
      mockCategoryRepo.find.mockResolvedValue([]);

      const result = await service.list('user-id-1');

      expect(mockCategoryRepo.find).toHaveBeenCalledWith({
        where: { authorId: 'user-id-1' },
        order: { name: 'ASC' },
      });
      expect(result).toEqual([]);
    });

    it('should handle repository find errors', async () => {
      mockCategoryRepo.find.mockRejectedValue(new Error('Database error'));

      await expect(service.list('user-id-1')).rejects.toThrow('Database error');
      expect(mockCategoryRepo.find).toHaveBeenCalledWith({
        where: { authorId: 'user-id-1' },
        order: { name: 'ASC' },
      });
    });
  });

  describe('update', () => {
    it('should update a category successfully', async () => {
      const updateDto = { name: 'Updated Category' };
      const updatedCategory = { ...mockCategory, ...updateDto };

      mockCategoryRepo.update.mockResolvedValue({ affected: 1 });
      mockCategoryRepo.findOne.mockResolvedValue(updatedCategory);

      const result = await service.update('test-id-1', updateDto);

      expect(mockCategoryRepo.update).toHaveBeenCalledWith(
        'test-id-1',
        updateDto,
      );
      expect(mockCategoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
      });
      expect(result).toEqual(updatedCategory);
    });

    it('should handle partial updates', async () => {
      const updateDto = { name: 'Partially Updated' };
      const updatedCategory = { ...mockCategory, ...updateDto };

      mockCategoryRepo.update.mockResolvedValue({ affected: 1 });
      mockCategoryRepo.findOne.mockResolvedValue(updatedCategory);

      const result = await service.update('test-id-1', updateDto);

      expect(mockCategoryRepo.update).toHaveBeenCalledWith(
        'test-id-1',
        updateDto,
      );
      expect(result).toEqual(updatedCategory);
    });

    it('should return null when category not found after update', async () => {
      const updateDto = { name: 'Updated Category' };

      mockCategoryRepo.update.mockResolvedValue({ affected: 1 });
      mockCategoryRepo.findOne.mockResolvedValue(null);

      const result = await service.update('non-existent-id', updateDto);

      expect(mockCategoryRepo.update).toHaveBeenCalledWith(
        'non-existent-id',
        updateDto,
      );
      expect(mockCategoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
      expect(result).toBeNull();
    });

    it('should handle repository update errors', async () => {
      const updateDto = { name: 'Updated Category' };

      mockCategoryRepo.update.mockRejectedValue(new Error('Database error'));

      await expect(service.update('test-id-1', updateDto)).rejects.toThrow(
        'Database error',
      );
      expect(mockCategoryRepo.update).toHaveBeenCalledWith(
        'test-id-1',
        updateDto,
      );
    });

    it('should handle repository findOne errors after update', async () => {
      const updateDto = { name: 'Updated Category' };

      mockCategoryRepo.update.mockResolvedValue({ affected: 1 });
      mockCategoryRepo.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.update('test-id-1', updateDto)).rejects.toThrow(
        'Database error',
      );
      expect(mockCategoryRepo.update).toHaveBeenCalledWith(
        'test-id-1',
        updateDto,
      );
      expect(mockCategoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
      });
    });
  });

  describe('delete', () => {
    it('should delete a category successfully', async () => {
      mockCategoryRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.delete('test-id-1');

      expect(mockCategoryRepo.delete).toHaveBeenCalledWith('test-id-1');
      expect(result).toEqual({ deleted: true });
    });

    it('should return success even when category does not exist', async () => {
      mockCategoryRepo.delete.mockResolvedValue({ affected: 0 });

      const result = await service.delete('non-existent-id');

      expect(mockCategoryRepo.delete).toHaveBeenCalledWith('non-existent-id');
      expect(result).toEqual({ deleted: true });
    });

    it('should handle repository delete errors', async () => {
      mockCategoryRepo.delete.mockRejectedValue(new Error('Database error'));

      await expect(service.delete('test-id-1')).rejects.toThrow(
        'Database error',
      );
      expect(mockCategoryRepo.delete).toHaveBeenCalledWith('test-id-1');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty string id in getById', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(null);

      const result = await service.getById('');

      expect(mockCategoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: '' },
      });
      expect(result).toBeNull();
    });

    it('should handle empty string id in update', async () => {
      const updateDto = { name: 'Updated Category' };

      mockCategoryRepo.update.mockResolvedValue({ affected: 0 });
      mockCategoryRepo.findOne.mockResolvedValue(null);

      const result = await service.update('', updateDto);

      expect(mockCategoryRepo.update).toHaveBeenCalledWith('', updateDto);
      expect(result).toBeNull();
    });

    it('should handle empty string id in delete', async () => {
      mockCategoryRepo.delete.mockResolvedValue({ affected: 0 });

      const result = await service.delete('');

      expect(mockCategoryRepo.delete).toHaveBeenCalledWith('');
      expect(result).toEqual({ deleted: true });
    });

    it('should handle null/undefined userId in list', async () => {
      const allCategories = [mockCategory, mockCategory2];
      mockCategoryRepo.find.mockResolvedValue(allCategories);

      const result = await service.list(undefined);

      expect(mockCategoryRepo.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
      expect(result).toEqual(allCategories);
    });
  });
});
