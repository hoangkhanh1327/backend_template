import { IBaseRepository } from '@/core/database/ibase.repository';
import { RefreshTokenEntity } from '@/modules/auth/entities/refresh-token.entity';

export interface IRefreshTokenRepository extends IBaseRepository<RefreshTokenEntity> {
    createToken(data: Partial<RefreshTokenEntity>): Promise<RefreshTokenEntity>;
    findByJti(jti: string): Promise<RefreshTokenEntity | null>;
    revokeByJti(jti: string): Promise<void>;
    revokeAllUserTokens(userId: string): Promise<void>;
}

export const REFRESH_TOKEN_REPOSITORY_TOKEN = Symbol('IRefreshTokenRepository');
