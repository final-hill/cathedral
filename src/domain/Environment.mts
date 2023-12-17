import type { Uuid } from '~/types/Uuid.mjs';
import PEGS from './PEGS.mjs';
import type { Properties } from '~/types/Properties.mjs';

/**
 * The set of entities (people, organizations, regulations, devices and other material objects, other systems)
 * external to the project or system but with the potential to affect it or be affected by it.
 *
 * An environment describes the application domain and external context in which a
 * system operates.
 */
export default class Environment extends PEGS {
    glossary: Uuid[];

    constructor(options: Properties<Environment>) {
        super(options);
        this.glossary = options.glossary;
    }
}