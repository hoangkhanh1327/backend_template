import { DeepPartial, FindManyOptions, FindOneOptions, FindOptionsWhere, SaveOptions, UpdateResult } from 'typeorm';

export interface IBaseRepository<T> {
    create(entityLike: DeepPartial<T>): T;
    create(entityLikes: DeepPartial<T>[]): T[];
    find(options?: FindManyOptions<T>): Promise<T[]>;
    findOne(options: FindOneOptions<T>): Promise<T | null>;
    findOneBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T | null>;
    findOneOrFail(options: FindOneOptions<T>): Promise<T>;
    findOneByOrFail(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T>;
    save(entity: DeepPartial<T>, options?: SaveOptions): Promise<T>;
    saveBulk(entities: DeepPartial<T>[], chunkSize?: number): Promise<T[]>;
    update(where: FindOptionsWhere<T>, partialEntity: DeepPartial<T>): Promise<UpdateResult>;
    delete(id: string | number): Promise<boolean>;
    deleteBulk(ids: (string | number)[]): Promise<number>;
    softDelete(id: string | number): Promise<boolean>;
    softDeleteBulk(ids: (string | number)[]): Promise<number>;
    restore(id: string | number): Promise<boolean>;
    findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]>;
    count(options?: FindManyOptions<T>): Promise<number>;
    exists(where: FindOptionsWhere<T>): Promise<boolean>;
}
