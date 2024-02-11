import { Behavior } from '~/domain/index.mjs';
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import StorageRepository from './StorageRepository.mjs';
// @ts-expect-error: No typings available
import DomStorage from 'dom-storage';
import BehaviorToJsonMapper from '~/mappers/BehaviorToJsonMapper.mjs';

describe('LocalStorageRepository', () => {
    const repository = new StorageRepository<Behavior>(
        'localstorage-test',
        new DomStorage(null, { strict: true }),
        new BehaviorToJsonMapper('0.3.0')
    );

    test('storage property', () => {
        assert(repository.storage instanceof DomStorage);
    });

    test('add/get', async () => {
        const id = crypto.randomUUID(),
            behavior = new Behavior({ id, statement: 'behavior' });
        await repository.add(behavior);
        const result = await repository.get(id);
        assert(result instanceof Behavior);
        assert.strictEqual(result.equals(behavior), true);

        await repository.delete(id);
    });

    test('failed get', async () => {
        const result = await repository.get(crypto.randomUUID());
        assert.strictEqual(result, undefined);
    });

    test('getAll', async () => {
        const bs = Array.from({ length: 3 }, (_, i) =>
            new Behavior({
                id: crypto.randomUUID(),
                statement: `behavior ${i}`
            })
        );
        await Promise.all(bs.map(b => repository.add(b)));
        const result = await repository.getAll();
        assert.strictEqual(result.length, 3);
        assert.strictEqual(result.every(b => b instanceof Behavior), true);
        result.forEach(b => assert.strictEqual(bs.some(_b => _b.equals(b)), true));

        await Promise.all(bs.map(b => repository.delete(b.id)));
    });

    test('failed getAll', async () => {
        repository.clear();
        const result = await repository.getAll();
        assert.strictEqual(result.length, 0);
    });

    test('update', async () => {
        const id = crypto.randomUUID(),
            behavior = new Behavior({ id, statement: 'behavior' });
        await repository.add(behavior);
        const result = await repository.get(id);
        assert(result instanceof Behavior);
        assert.strictEqual(result.equals(behavior), true);
        behavior.statement = 'updated behavior';
        await repository.update(behavior);
        const updated = await repository.get(id);
        assert(updated instanceof Behavior);
        assert.strictEqual(updated?.equals(behavior), true);

        await repository.delete(id);
    });

    test('update throws', async () => {
        repository.clear();
        const id = crypto.randomUUID(),
            behavior = new Behavior({ id, statement: 'behavior' });

        await assert.rejects(async () => {
            await repository.update(behavior);
        });
    });

    test('delete', async () => {
        const id = crypto.randomUUID(),
            behavior = new Behavior({ id, statement: 'behavior' });
        await repository.add(behavior);
        const result = await repository.get(id);
        assert(result instanceof Behavior);
        assert.strictEqual(result.equals(behavior), true);
        await repository.delete(id);
        const deleted = await repository.get(id);
        assert.strictEqual(deleted, undefined);
    });

    test('delete throws', async () => {
        repository.clear();
        const id = crypto.randomUUID();
        await assert.rejects(async () => {
            await repository.delete(id);
        });
    });

    test('clear', async () => {
        const bs = Array.from({ length: 3 }, (_, i) =>
            new Behavior({
                id: crypto.randomUUID(),
                statement: `behavior ${i}`
            })
        );
        await Promise.all(bs.map(b => repository.add(b)));
        const result = await repository.getAll();
        assert.strictEqual(result.length, 3);
        assert.strictEqual(result.every(b => b instanceof Behavior), true);
        result.forEach(b => assert.strictEqual(bs.some(_b => _b.equals(b)), true));
        await repository.clear();
        const cleared = await repository.getAll();
        assert.strictEqual(cleared.length, 0);
    });
});