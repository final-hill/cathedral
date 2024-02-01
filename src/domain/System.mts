import type { Properties } from '~/types/Properties.mjs';
import Entity from './Entity.mjs';
import type { Uuid } from './Uuid.mjs';

export default class System extends Entity {
    parentId!: Uuid;

    constructor({ id, parentId }: Properties<System>) {
        super({ id });
        this.parentId = parentId;
    }
}