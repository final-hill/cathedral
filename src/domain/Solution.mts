import type { Properties } from '~/types/Properties.mjs';
import type { Uuid } from '~/domain/Uuid.mjs';
import SlugEntity from './SlugEntity.mjs';

export default class Solution extends SlugEntity {
    projectId!: Uuid;
    environmentId!: Uuid;
    goalsId!: Uuid;
    systemId!: Uuid;

    constructor({ id, name, description, ...rest }: Properties<Solution>) {
        super({ id, name, description });
        Object.assign(this, rest);
    }
}