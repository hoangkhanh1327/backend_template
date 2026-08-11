import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '@/modules/users/entities/user.entity';
import { UserEventsListener } from '@/modules/users/listeners/user-events.listener';
import { UserController } from '@/modules/users/user.controller';
import { UserService } from '@/modules/users/user.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    controllers: [UserController],
    providers: [UserService, UserEventsListener],
    exports: [UserService, TypeOrmModule],
})
export class UserModule {}
