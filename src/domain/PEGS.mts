import type { Properties } from '~/types/Properties.mjs';
import { Entity, type EntityJson } from './Entity.mjs';

export interface PEGSJson extends EntityJson {
    name: string;
    description: string;
}

/**
 * The base class for all PEGS (Project, Environment, Goal, System)
 */
export class PEGS extends Entity {
    static readonly maxNameLength = 60;
    static readonly maxDescriptionLength = 200;

    static slugify(str: string) {
        return str.toLowerCase().trim()
            .replace(/\s/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-');
    }

    static override fromJSON(json: PEGSJson): PEGS {
        return new PEGS({
            id: json.id,
            description: json.description,
            name: json.name
        });
    }

    private _name!: string;
    private _description!: string;

    constructor(options: Properties<PEGS>) {
        super(options);
        this.name = options.name;
        this.description = options.description;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        const trimmed = value.trim(),
            Clazz = this.constructor as typeof PEGS;
        if (trimmed.length >= Clazz.maxNameLength)
            throw new Error('Project name cannot be longer than 60 characters');
        this._name = trimmed;
    }

    get description(): string {
        return this._description;
    }

    set description(value: string) {
        const trimmed = value.trim(),
            Clazz = this.constructor as typeof PEGS;
        if (trimmed.length >= Clazz.maxDescriptionLength)
            throw new Error('Project description cannot be longer than 200 characters');
        this._description = trimmed;
    }

    slug(): string {
        return PEGS.slugify(this.name);
    }

    override toJSON(): PEGSJson {
        return {
            ...super.toJSON(),
            name: this.name,
            description: this.description
        };
    }
}