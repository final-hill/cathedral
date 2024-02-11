import type { Properties } from '~/types/Properties.mjs';
import { Entity } from './index.mjs';

export class GlossaryTerm extends Entity {
    definition!: string;
    term!: string;

    constructor({ id, ...rest }: Properties<GlossaryTerm>) {
        super({ id });
        Object.assign(this, rest);
    }
}