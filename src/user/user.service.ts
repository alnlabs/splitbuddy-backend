import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUsers(fields?: string[]) {
    try {
      let query = this.userRepository.createQueryBuilder('user');

      if (fields && fields.length > 0) {
        // Only select specified fields
        const selectFields = fields.map((field) => `user.${field}`);
        query = query.select(selectFields);
      } else {
        // Select all fields except password
        query = query.select([
          'user.id',
          'user.email',
          'user.firstName',
          'user.lastName',
          'user.username',
          'user.phone',
          'user.middleName',
          'user.dateOfBirth',
          'user.gender',
          'user.nationality',
          'user.address',
          'user.city',
          'user.state',
          'user.country',
          'user.zipCode',
          'user.facebookProfileUrl',
          'user.twitterProfileUrl',
          'user.linkedinProfileUrl',
          'user.githubProfileUrl',
          'user.websiteUrl',
          'user.enabled',
          'user.createdAt',
          'user.updatedAt',
        ]);
      }

      const users = await query.getMany();
      return users;
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }
}
