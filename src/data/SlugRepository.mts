import type SlugEntity from '~/domain/SlugEntity.mjs';
import StorageRepository from './StorageRepository.mjs';
import type Mapper from '~/application/Mapper.mjs';
import type { EntityJson } from '~/mappers/EntityToJsonMapper.mjs';

export default abstract class SlugRepository<E extends SlugEntity> extends StorageRepository<E> {
    constructor(storageKey: string, storage: Storage, mapper: Mapper<E, EntityJson>) {
        super(storageKey, storage, mapper);
    }

    async getBySlug(slug: string): Promise<E | undefined> {
        return (await this.getAll()).find(e => e.slug() === slug);
    }
}