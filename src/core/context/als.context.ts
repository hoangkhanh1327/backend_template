import { AsyncLocalStorage } from 'async_hooks';
import { EntityManager } from 'typeorm';

export interface RequestStore {
    traceId: string;
    userId?: string;
    userRoles?: string[];
    entityManager?: EntityManager;
}

export class AlsContext {
    private static readonly storage = new AsyncLocalStorage<RequestStore>();

    static run<T>(store: RequestStore, callback: () => T): T {
        return this.storage.run(store, callback);
    }

    static getStore(): RequestStore | undefined {
        return this.storage.getStore();
    }

    static getTraceId(): string {
        return this.getStore()?.traceId || 'unknown-trace-id';
    }

    static getUserId(): string | undefined {
        return this.getStore()?.userId;
    }

    static getUserRoles(): string[] | undefined {
        return this.getStore()?.userRoles;
    }

    static setEntityManager(em: EntityManager): void {
        const store = this.getStore();
        if (store) {
            store.entityManager = em;
        }
    }

    static getEntityManager(): EntityManager | undefined {
        return this.getStore()?.entityManager;
    }
}
