import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';

import { Transactional } from '@/core/database/transaction.decorator';
import { PinoLoggerService } from '@/core/logger/logger.service';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UserEntity } from '@/modules/users/entities/user.entity';
import { IUserRepository } from '@/modules/users/repositories/user.repository.interface';
import { DOMAIN_EVENTS } from '@/shared/constants/events.constant';
import { REPOSITORY_TOKENS } from '@/shared/constants/tokens.constant';

@Injectable()
export class UserService {
    constructor(
        @Inject(REPOSITORY_TOKENS.USER_REPOSITORY)
        private readonly userRepo: IUserRepository,
        private readonly eventEmitter: EventEmitter2,
        private readonly logger: PinoLoggerService,
        public readonly dataSource: DataSource, // Required by @Transactional()
    ) {}

    @Transactional()
    async createUser(dto: CreateUserDto): Promise<UserEntity> {
        const existing = await this.userRepo.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException('Email already exists');
        }

        const user = await this.userRepo.save({
            email: dto.email,
            username: dto.username,
            passwordHash: dto.password, // In real app, hash password using bcrypt
            roles: ['USER'],
        });

        this.logger.log(`Created user ${user.id}`, 'UserService');

        // Emit event for cross-module side effects (Decoupled Integration)
        this.eventEmitter.emit(DOMAIN_EVENTS.USER_CREATED, {
            userId: user.id,
            email: user.email,
        });

        return user;
    }

    async findById(id: string): Promise<UserEntity | null> {
        return this.userRepo.findOne({ where: { id } });
    }

    async findAll(): Promise<UserEntity[]> {
        return this.userRepo.find();
    }
}
