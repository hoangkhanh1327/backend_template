import { DataSource } from 'typeorm';

import { AlsContext } from '@/core/context/als.context';

export function Transactional() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const dataSource: DataSource = (this as any).dataSource;
            if (!dataSource) {
                throw new Error(`@Transactional decorator requires a 'dataSource: DataSource' property injected in ${target.constructor.name}`);
            }

            // Check if already inside an active transaction
            const existingEm = AlsContext.getEntityManager();
            if (existingEm) {
                return originalMethod.apply(this, args);
            }

            const queryRunner = dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                AlsContext.setEntityManager(queryRunner.manager);
                const result = await originalMethod.apply(this, args);
                await queryRunner.commitTransaction();
                return result;
            } catch (err) {
                await queryRunner.rollbackTransaction();
                throw err;
            } finally {
                await queryRunner.release();
            }
        };

        return descriptor;
    };
}
