import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from '@/modules/users/controllers/user.controller';
import { UserEntity } from '@/modules/users/entities/user.entity';
import { UserEventsListener } from '@/modules/users/listeners/user-events.listener';
import { UserRepository } from '@/modules/users/repositories/user.repository';
import { UserService } from '@/modules/users/services/user.service';
import { REPOSITORY_TOKENS } from '@/shared/constants/tokens.constant';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    controllers: [UserController],
    providers: [
        UserService,
        UserEventsListener,
        {
            provide: REPOSITORY_TOKENS.USER_REPOSITORY,
            useClass: UserRepository,
        },
    ],
    exports: [UserService, REPOSITORY_TOKENS.USER_REPOSITORY],
})
export class UserModule {}
