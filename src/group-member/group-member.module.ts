import { Module } from '@nestjs/common';
import { GroupMemberService } from './group-member.service';
import { GroupMemberController } from './group-member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGroupMember } from '../entities/user-group-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserGroupMember])],
  controllers: [GroupMemberController],
  providers: [GroupMemberService],
  exports: [GroupMemberService],
})
export class GroupMemberModule {}
