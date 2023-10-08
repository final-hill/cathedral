import { PEGS } from "./PEGS";

/**
 * The set of entities (people, organizations, regulations, devices and other material objects, other systems)
 * external to the project or system but with the potential to affect it or be affected by it.
 *
 * An environment describes the application domain and external context in which a
 * system operates.
 */
export class Environment extends PEGS {
    private _glossaryId: string;

    constructor({ id, name, description, glossaryId }: { id?: string, name: string, description?: string, glossaryId: string }) {
        super({ id, name, description });
        this._glossaryId = glossaryId
    }

    get glossaryId(): string {
        return this._glossaryId;
    }

    override toJSON(): Record<string, any> {
        return {
            ...super.toJSON(),
            glossaryId: this._glossaryId
        }
    }
}