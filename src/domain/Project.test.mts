import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Project } from './Project.mjs';

describe('Project', () => {
    test('fromJSON', () => {
        const uuid = crypto.randomUUID(),
            project = Project.fromJSON({
                id: uuid,
                name: 'Sample Project',
                description: 'test'
            });
        assert.strictEqual(project.id, uuid);
        assert.strictEqual(project.name, 'Sample Project');
        assert.strictEqual(project.description, 'test');
        assert.strictEqual(project.slug(), 'sample-project');
    });

    test('toJSON', () => {
        const uuid = crypto.randomUUID(),
            project = new Project({ id: uuid, description: 'test', name: 'test' }),
            json = project.toJSON();
        assert.strictEqual(json.id, uuid);
        assert.strictEqual(json.description, 'test');
        assert.strictEqual(json.name, 'test');
    });
});