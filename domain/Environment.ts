import { Glossary, type GlossaryJson } from "./Glossary";
import { PEGS, type PEGSJson } from "./PEGS";
import type { Properties } from "./types/Properties";

export interface EnvironmentJson extends PEGSJson {
    glossary: GlossaryJson
}

/**
 * The set of entities (people, organizations, regulations, devices and other material objects, other systems)
 * external to the project or system but with the potential to affect it or be affected by it.
 *
 * An environment describes the application domain and external context in which a
 * system operates.
 */
export class Environment extends PEGS {
    static override STORAGE_KEY = 'environments';

    static override fromJSON(json: EnvironmentJson): Environment {
        return new Environment({
            description: json.description,
            id: json.id,
            name: json.name,
            glossary: Glossary.fromJSON(json.glossary)
        });
    }

    private _glossary;

    constructor(options: Properties<Environment>) {
        super(options);
        this._glossary = options.glossary
    }

    get glossary(): Glossary {
        return this._glossary;
    }

    override toJSON(): EnvironmentJson {
        return {
            ...super.toJSON(),
            glossary: this._glossary.toJSON()
        }
    }
}