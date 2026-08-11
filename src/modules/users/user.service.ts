import { ConflictException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Transactional } from '@/core/database/transaction.decorator';
import { PinoLoggerService } from '@/core/logger/logger.service';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UserEntity } from '@/modules/users/entities/user.entity';
import { DOMAIN_EVENTS } from '@/shared/constants/events.constant';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        private readonly eventEmitter: EventEmitter2,
        private readonly logger: PinoLoggerService,
        public readonly dataSource: DataSource, // Required by @Transactional()
    ) {}

    @Transactional()
    async createUser(dto: CreateUserDto): Promise<UserEntity> {
        const existing = await this.userRepo.findOne({
            where: { email: dto.email },
        });
        if (existing) {
            throw new ConflictException('Email already exists');
        }

        const user = this.userRepo.create({
            email: dto.email,
            username: dto.username,
            passwordHash: dto.password,
            roles: ['USER'],
        });

        const savedUser = await this.userRepo.save(user);

        this.logger.log(`Created user ${savedUser.id}`, 'UserService');

        this.eventEmitter.emit(DOMAIN_EVENTS.USER_CREATED, {
            userId: savedUser.id,
            email: savedUser.email,
        });

        return savedUser;
    }

    async findById(id: string): Promise<UserEntity | null> {
        return this.userRepo.findOne({ where: { id } });
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.userRepo.findOne({ where: { email } });
    }

    async findAll(): Promise<UserEntity[]> {
        return this.userRepo.find();
    }
}
