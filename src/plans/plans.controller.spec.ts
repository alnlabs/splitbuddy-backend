import { Test, TestingModule } from '@nestjs/testing';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { Request } from 'express';

describe('PlansController', () => {
  let controller: PlansController;
  let service: PlansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlansController],
      providers: [
        {
          provide: PlansService,
          useValue: {
            getAllPlansForUser: jest.fn(),
            createPlan: jest.fn(),
            getPlanById: jest.fn(),
            updatePlan: jest.fn(),
            deletePlan: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PlansController>(PlansController);
    service = module.get<PlansService>(PlansService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllPlans', () => {
    it('should return all plans for user from req.user', async () => {
      const mockRequest = {
        user: { userId: 'test-user-id' },
        headers: {},
      } as unknown as Request;
      const mockPlans = [
        { id: '1', name: 'Plan 1', type: 'chit' } as any,
        { id: '2', name: 'Plan 2', type: 'savings' } as any,
      ];

      jest.spyOn(service, 'getAllPlansForUser').mockResolvedValue(mockPlans);

      const result = await controller.getAllPlans(mockRequest);

      expect(service.getAllPlansForUser).toHaveBeenCalledWith('test-user-id');
      expect(result).toEqual(mockPlans);
    });

    it('should return all plans for user from headers', async () => {
      const mockRequest = {
        user: null,
        headers: { 'x-user-id': 'header-user-id' },
      } as unknown as Request;
      const mockPlans = [{ id: '1', name: 'Plan 1', type: 'chit' } as any];

      jest.spyOn(service, 'getAllPlansForUser').mockResolvedValue(mockPlans);

      const result = await controller.getAllPlans(mockRequest);

      expect(service.getAllPlansForUser).toHaveBeenCalledWith('header-user-id');
      expect(result).toEqual(mockPlans);
    });

    it('should use default user id when neither user nor header is present', async () => {
      const mockRequest = {
        user: null,
        headers: {},
      } as unknown as Request;
      const mockPlans = [{ id: '1', name: 'Plan 1', type: 'chit' } as any];

      jest.spyOn(service, 'getAllPlansForUser').mockResolvedValue(mockPlans);

      const result = await controller.getAllPlans(mockRequest);

      expect(service.getAllPlansForUser).toHaveBeenCalledWith('test-user-id');
      expect(result).toEqual(mockPlans);
    });
  });

  describe('createPlan', () => {
    it('should create a plan', async () => {
      const mockRequest = {
        user: { userId: 'test-user-id' },
        headers: {},
      } as unknown as Request;
      const planData = { type: 'chit', name: 'Test Plan' };
      const mockCreatedPlan = { id: '1', ...planData } as any;

      jest.spyOn(service, 'createPlan').mockResolvedValue(mockCreatedPlan);

      const result = await controller.createPlan(planData, mockRequest);

      expect(service.createPlan).toHaveBeenCalledWith(planData, 'test-user-id');
      expect(result).toEqual(mockCreatedPlan);
    });

    it('should create a plan using header user id', async () => {
      const mockRequest = {
        user: null,
        headers: { 'x-user-id': 'header-user-id' },
      } as unknown as Request;
      const planData = { type: 'savings', name: 'Test Savings' };
      const mockCreatedPlan = { id: '1', ...planData } as any;

      jest.spyOn(service, 'createPlan').mockResolvedValue(mockCreatedPlan);

      const result = await controller.createPlan(planData, mockRequest);

      expect(service.createPlan).toHaveBeenCalledWith(
        planData,
        'header-user-id',
      );
      expect(result).toEqual(mockCreatedPlan);
    });
  });

  describe('getPlanById', () => {
    it('should return a plan by id', async () => {
      const planId = '1';
      const mockPlan = { id: planId, name: 'Test Plan', type: 'chit' } as any;

      jest.spyOn(service, 'getPlanById').mockResolvedValue(mockPlan);

      const result = await controller.getPlanById(planId);

      expect(service.getPlanById).toHaveBeenCalledWith(planId);
      expect(result).toEqual(mockPlan);
    });
  });

  describe('updatePlan', () => {
    it('should update a plan', async () => {
      const mockRequest = {
        user: { userId: 'test-user-id' },
        headers: {},
      } as unknown as Request;
      const planId = '1';
      const updateData = { name: 'Updated Plan' };
      const mockUpdatedPlan = {
        id: planId,
        ...updateData,
        type: 'chit',
      } as any;

      jest.spyOn(service, 'updatePlan').mockResolvedValue(mockUpdatedPlan);

      const result = await controller.updatePlan(
        planId,
        updateData,
        mockRequest,
      );

      expect(service.updatePlan).toHaveBeenCalledWith(
        planId,
        updateData,
        'test-user-id',
      );
      expect(result).toEqual(mockUpdatedPlan);
    });

    it('should update a plan using header user id', async () => {
      const mockRequest = {
        user: null,
        headers: { 'x-user-id': 'header-user-id' },
      } as unknown as Request;
      const planId = '1';
      const updateData = { name: 'Updated Plan' };
      const mockUpdatedPlan = {
        id: planId,
        ...updateData,
        type: 'savings',
      } as any;

      jest.spyOn(service, 'updatePlan').mockResolvedValue(mockUpdatedPlan);

      const result = await controller.updatePlan(
        planId,
        updateData,
        mockRequest,
      );

      expect(service.updatePlan).toHaveBeenCalledWith(
        planId,
        updateData,
        'header-user-id',
      );
      expect(result).toEqual(mockUpdatedPlan);
    });
  });

  describe('deletePlan', () => {
    it('should delete a plan', async () => {
      const planId = '1';

      jest.spyOn(service, 'deletePlan').mockResolvedValue({} as any);

      const result = await controller.deletePlan(planId);

      expect(service.deletePlan).toHaveBeenCalledWith(planId);
      expect(result).toEqual({});
    });
  });
});
