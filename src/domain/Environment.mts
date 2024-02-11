import type { Properties } from '~/types/Properties.mjs';
import { type Assumption, Component, type Constraint, type Effect, Entity, type GlossaryTerm, type Invariant } from './index.mjs';

/**
 * The set of entities (people, organizations, regulations, devices and other material objects, other systems)
 * external to the project or system but with the potential to affect it or be affected by it.
 *
 * An environment describes the application domain and external context in which a
 * system operates.
 */
export class Environment extends Entity {
    glossaryTerms!: GlossaryTerm[];
    constraints!: Constraint[];
    invariants!: Invariant[];
    assumptions!: Assumption[];
    effects!: Effect[];
    components!: Component[];

    constructor({ id, ...rest }: Properties<Environment>) {
        super({ id });
        Object.assign(this, rest);
    }
}