import type PEGS from '~/domain/PEGS.mjs';
import { LocalStorageRepository } from './LocalStorageRepository.mjs';
import type Mapper from '~/usecases/Mapper.mjs';
import type { EntityJson } from '~/mappers/EntityToJsonMapper.mjs';

export abstract class PEGSRepository<E extends PEGS> extends LocalStorageRepository<E> {
    constructor(storageKey: string, mapper: Mapper<E, EntityJson>) {
        super(storageKey, mapper);
    }

    async getBySlug(slug: string): Promise<E | undefined> {
        return (await this.getAll()).find(e => e.slug() === slug);
    }
}