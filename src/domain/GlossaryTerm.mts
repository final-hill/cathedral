import type { Properties } from '~/types/Properties.mjs';
import Entity from './Entity.mjs';

export default class GlossaryTerm extends Entity {
    definition: string;
    term: string;

    constructor({ id, term, definition }: Properties<GlossaryTerm>) {
        super({ id });
        this.term = term;
        this.definition = definition;
    }
}