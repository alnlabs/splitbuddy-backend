import { Test, TestingModule } from '@nestjs/testing';
import { ChitFundController } from './chit-fund.controller';
import { ChitFundService } from './chit-fund.service';
import { CreateChitFundDto, UpdateChitFundDto } from './chit-fund.dto';

describe('ChitFundController', () => {
  let controller: ChitFundController;
  let service: ChitFundService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChitFundController],
      providers: [
        {
          provide: ChitFundService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ChitFundController>(ChitFundController);
    service = module.get<ChitFundService>(ChitFundService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a chit fund', async () => {
      const createDto: CreateChitFundDto = {
        name: 'Test Chit Fund',
        type: 'personal' as any,
        members: ['user1', 'user2'],
        amount: 10000,
        duration: 12,
        monthlyContribution: 1000,
      };
      const mockCreatedChitFund = { id: '1', ...createDto } as any;

      jest.spyOn(service, 'create').mockResolvedValue(mockCreatedChitFund);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockCreatedChitFund);
    });
  });

  describe('findAll', () => {
    it('should return all chit funds', async () => {
      const mockChitFunds = [
        { id: '1', name: 'Chit Fund 1', amount: 10000 } as any,
        { id: '2', name: 'Chit Fund 2', amount: 20000 } as any,
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(mockChitFunds);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockChitFunds);
    });
  });

  describe('findOne', () => {
    it('should return a chit fund by id', async () => {
      const chitFundId = '1';
      const mockChitFund = {
        id: chitFundId,
        name: 'Test Chit Fund',
        amount: 10000,
      } as any;

      jest.spyOn(service, 'findOne').mockResolvedValue(mockChitFund);

      const result = await controller.findOne(chitFundId);

      expect(service.findOne).toHaveBeenCalledWith(chitFundId);
      expect(result).toEqual(mockChitFund);
    });
  });

  describe('update', () => {
    it('should update a chit fund', async () => {
      const chitFundId = '1';
      const updateDto: UpdateChitFundDto = {
        name: 'Updated Chit Fund',
        amount: 15000,
        type: 'personal' as any,
        members: ['user1', 'user2'],
        duration: 12,
        monthlyContribution: 1000,
      };
      const mockUpdatedChitFund = { id: chitFundId, ...updateDto } as any;

      jest.spyOn(service, 'update').mockResolvedValue(mockUpdatedChitFund);

      const result = await controller.update(chitFundId, updateDto);

      expect(service.update).toHaveBeenCalledWith(chitFundId, updateDto);
      expect(result).toEqual(mockUpdatedChitFund);
    });
  });

  describe('remove', () => {
    it('should remove a chit fund', async () => {
      const chitFundId = '1';

      jest.spyOn(service, 'remove').mockResolvedValue({} as any);

      const result = await controller.remove(chitFundId);

      expect(service.remove).toHaveBeenCalledWith(chitFundId);
      expect(result).toEqual({});
    });
  });
});
