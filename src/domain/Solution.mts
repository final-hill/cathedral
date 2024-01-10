import type { Properties } from '~/types/Properties.mjs';
import type { Uuid } from '~/types/Uuid.mjs';
import SlugEntity from './SlugEntity.mjs';

export default class Solution extends SlugEntity {
    projectId!: Uuid;
    environmentId!: Uuid;
    goalsId!: Uuid;
    systemId!: Uuid;

    constructor(options: Properties<Solution>) {
        super(options);
        Object.assign(this, options);
    }
}