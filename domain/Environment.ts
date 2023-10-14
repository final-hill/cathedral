import { Glossary } from "./Glossary";
import { PEGS } from "./PEGS";

export interface EnvironmentOptions {
    id?: string;
    name: string;
    description?: string;
    glossary?: Glossary;
}

/**
 * The set of entities (people, organizations, regulations, devices and other material objects, other systems)
 * external to the project or system but with the potential to affect it or be affected by it.
 *
 * An environment describes the application domain and external context in which a
 * system operates.
 */
export class Environment extends PEGS {
    private _glossary;

    constructor({ id, name, description, glossary }: EnvironmentOptions) {
        super({ id, name, description });
        this._glossary = glossary ?? new Glossary();
    }

    get glossary(): Glossary {
        return this._glossary;
    }
}