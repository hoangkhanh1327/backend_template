import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseRepository } from '@/core/database/base.repository';
import { RefreshTokenEntity } from '@/modules/auth/entities/refresh-token.entity';
import { IRefreshTokenRepository } from '@/modules/auth/interfaces/refresh-token.repository.interface';

@Injectable()
export class RefreshTokenRepository extends BaseRepository<RefreshTokenEntity> implements IRefreshTokenRepository {
    constructor(
        @InjectRepository(RefreshTokenEntity)
        repository: Repository<RefreshTokenEntity>,
    ) {
        super(RefreshTokenEntity, repository);
    }

    async createToken(data: Partial<RefreshTokenEntity>): Promise<RefreshTokenEntity> {
        const tokenEntity = this.repo.create(data);
        return this.repo.save(tokenEntity);
    }

    async findByJti(jti: string): Promise<RefreshTokenEntity | null> {
        return this.repo.findOne({ where: { jti } });
    }

    async revokeByJti(jti: string): Promise<void> {
        await this.repo.update({ jti }, { isRevoked: true });
    }

    async revokeAllUserTokens(userId: string): Promise<void> {
        await this.repo.update({ userId, isRevoked: false }, { isRevoked: true });
    }
}
