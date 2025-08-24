import { Test, TestingModule } from '@nestjs/testing';
import { GroupMemberController } from './group-member.controller';
import { GroupMemberService } from './group-member.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserGroupMember } from '../entities/user-group-member.entity';

describe('GroupMemberController', () => {
  let controller: GroupMemberController;
  let service: GroupMemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupMemberController],
      providers: [
        GroupMemberService,
        {
          provide: getRepositoryToken(UserGroupMember),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GroupMemberController>(GroupMemberController);
    service = module.get<GroupMemberService>(GroupMemberService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have service defined', () => {
    expect(service).toBeDefined();
  });
});
