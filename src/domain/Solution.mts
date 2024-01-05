import type { Properties } from '~/types/Properties.mjs';
import type { Uuid } from '~/types/Uuid.mjs';
import Entity from './Entity.mjs';

export default class Solution extends Entity {
    name!: string;
    description!: string;
    project!: Uuid;
    environment!: Uuid;
    goals!: Uuid;
    system!: Uuid;

    constructor(options: Properties<Solution>) {
        super(options);
        Object.assign(this, options);
    }
}