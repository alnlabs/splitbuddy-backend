import { Test, TestingModule } from '@nestjs/testing';
import { GroupMemberService } from './group-member.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserGroupMember } from '../entities/user-group-member.entity';

describe('GroupMemberService', () => {
  let service: GroupMemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<GroupMemberService>(GroupMemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
