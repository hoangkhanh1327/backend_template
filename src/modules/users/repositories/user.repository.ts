import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseRepository } from '@/core/database/base.repository';
import { UserEntity } from '@/modules/users/entities/user.entity';
import { IUserRepository } from '@/modules/users/repositories/user.repository.interface';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> implements IUserRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userTypeOrmRepo: Repository<UserEntity>,
    ) {
        super(UserEntity, userTypeOrmRepo);
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.findOne({ where: { email } });
    }

    async findByUsername(username: string): Promise<UserEntity | null> {
        return this.findOne({ where: { username } });
    }
}
