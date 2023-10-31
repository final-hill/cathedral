import { Entity, type EntityJson } from "./Entity";
import { slugify } from "./slugify";
import type { Properties } from "./types/Properties";

export interface PEGSJson extends EntityJson {
    name: string;
    description: string;
}

/**
 * The base class for all PEGS (Project, Environment, Goal, System)
 */
export abstract class PEGS extends Entity {
    static STORAGE_KEY = 'pegs';
    static MAX_NAME_LENGTH = 60;
    static MAX_DESCRIPTION_LENGTH = 200;

    private _name!: string;
    private _description!: string;

    constructor(options: Properties<PEGS>) {
        super(options)
        this.name = options.name;
        this.description = options.description;
    }

    get name(): string {
        return this._name;
    }
    set name(value: string) {
        const trimmed = value.trim(),
            Clazz = this.constructor as typeof PEGS
        if (trimmed.length >= Clazz.MAX_NAME_LENGTH)
            throw new Error('Project name cannot be longer than 60 characters')
        this._name = trimmed;
    }

    get description(): string {
        return this._description;
    }
    set description(value: string) {
        const trimmed = value.trim(),
            Clazz = this.constructor as typeof PEGS
        if (trimmed.length >= Clazz.MAX_DESCRIPTION_LENGTH)
            throw new Error('Project description cannot be longer than 200 characters')
        this._description = trimmed;
    }

    slug(): string {
        return slugify(this.name);
    }

    override toJSON(): PEGSJson {
        return {
            ...super.toJSON(),
            name: this.name,
            description: this.description
        }
    }
}