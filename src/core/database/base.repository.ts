import {
    DeepPartial,
    EntityTarget,
    FindManyOptions,
    FindOneOptions,
    FindOptionsWhere,
    ObjectLiteral,
    Repository,
    SaveOptions,
    UpdateResult,
} from 'typeorm';

import { AlsContext } from '@/core/context/als.context';
import { IBaseRepository } from '@/core/database/ibase.repository';

export abstract class BaseRepository<T extends ObjectLiteral> implements IBaseRepository<T> {
    constructor(
        protected readonly target: EntityTarget<T>,
        protected readonly defaultRepository: Repository<T>,
    ) {}

    /**
     * Retrieves active transactional EntityManager from AsyncLocalStorage if present,
     * otherwise falls back to defaultRepository.
     */
    protected get repo(): Repository<T> {
        const activeEm = AlsContext.getEntityManager();
        return activeEm ? activeEm.getRepository(this.target) : this.defaultRepository;
    }

    create(entityLike: DeepPartial<T>): T;
    create(entityLikes: DeepPartial<T>[]): T[];
    create(entityLikes: any): any {
        return this.repo.create(entityLikes);
    }

    async find(options?: FindManyOptions<T>): Promise<T[]> {
        return this.repo.find(options);
    }

    async findOne(options: FindOneOptions<T>): Promise<T | null> {
        return this.repo.findOne(options);
    }

    async findOneBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T | null> {
        return this.repo.findOneBy(where);
    }

    async findOneOrFail(options: FindOneOptions<T>): Promise<T> {
        return this.repo.findOneOrFail(options);
    }

    async findOneByOrFail(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T> {
        return this.repo.findOneByOrFail(where);
    }

    async save(entity: DeepPartial<T>, options?: SaveOptions): Promise<T> {
        const created = this.repo.create(entity);
        return this.repo.save(created as any, options);
    }

    async saveBulk(entities: DeepPartial<T>[], chunkSize = 500): Promise<T[]> {
        return this.repo.save(entities as any, { chunk: chunkSize });
    }

    async update(where: FindOptionsWhere<T>, partialEntity: DeepPartial<T>): Promise<UpdateResult> {
        return this.repo.update(where, partialEntity as any);
    }

    async delete(id: string | number): Promise<boolean> {
        const res = await this.repo.delete(id);
        return (res.affected ?? 0) > 0;
    }

    async deleteBulk(ids: (string | number)[]): Promise<number> {
        if (!ids?.length) return 0;
        const res = await this.repo.delete(ids as any);
        return res.affected || 0;
    }

    async softDelete(id: string | number): Promise<boolean> {
        const res = await this.repo.softDelete(id);
        return (res.affected ?? 0) > 0;
    }

    async softDeleteBulk(ids: (string | number)[]): Promise<number> {
        if (!ids?.length) return 0;
        const res = await this.repo.softDelete(ids as any);
        return res.affected || 0;
    }

    async restore(id: string | number): Promise<boolean> {
        const res = await this.repo.restore(id);
        return (res.affected ?? 0) > 0;
    }

    async findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]> {
        return this.repo.findAndCount(options);
    }

    async count(options?: FindManyOptions<T>): Promise<number> {
        return this.repo.count(options);
    }

    async exists(where: FindOptionsWhere<T>): Promise<boolean> {
        return this.repo.exists({ where });
    }
}
