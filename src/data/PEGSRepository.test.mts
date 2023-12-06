import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { PEGS } from '~/domain/PEGS.mjs';
// @ts-expect-error: No typings available
import DomStorage from 'dom-storage';
import { PEGSRepository } from './PEGSRepository.mjs';

const fakeStorage: Storage = new DomStorage(null, { strict: true });

class TestPEGSRepository extends PEGSRepository<PEGS> {
    constructor() { super('pegs', PEGS); }

    override get storage() {
        return fakeStorage;
    }
}

describe('PEGSRepository', () => {
    const repository = new TestPEGSRepository();

    test('getBySlug', async () => {
        const pegs = new PEGS({
            id: crypto.randomUUID(),
            name: 'Sample PEGS',
            description: 'This is a sample PEGS.'
        });

        await repository.add(pegs);

        const result = await repository.getBySlug(pegs.slug());
        assert(result instanceof PEGS);
        assert(pegs.equals(result));
    });
});