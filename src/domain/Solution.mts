import type { Properties } from '~/types/Properties.mjs';
import { SlugEntity, type Uuid } from './index.mjs';

export class Solution extends SlugEntity {
    projectId!: Uuid;
    environmentId!: Uuid;
    goalsId!: Uuid;
    systemId!: Uuid;

    constructor({ id, name, description, ...rest }: Properties<Solution>) {
        super({ id, name, description });
        Object.assign(this, rest);
    }
}