import { IBaseRepository } from '@/core/database/ibase.repository';
import { UserEntity } from '@/modules/users/entities/user.entity';

export interface IUserRepository extends IBaseRepository<UserEntity> {
    findByEmail(email: string): Promise<UserEntity | null>;
    findByUsername(username: string): Promise<UserEntity | null>;
}
