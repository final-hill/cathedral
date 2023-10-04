import { slugify } from './slugify';

/**
 * A Project is the set of human processes involved in the planning,
 * construction, revision, and operation of an associated system.
 */
export class Project {
    static MAX_NAME_LENGTH = 60;
    static MAX_DESCRIPTION_LENGTH = 200;

    #id: string
    #name!: string;
    #description!: string;

    constructor({ id, name, description }: { id?: string, name: string, description: string }) {
        this.#id = id ?? slugify(name);
        this.name = name.trim();
        this.description = description;
    }

    get id(): string {
        return this.#id;
    }

    get name(): string {
        return this.#name;
    }
    set name(value: string) {
        if (value.length >= Project.MAX_NAME_LENGTH)
            throw new Error('Project name cannot be longer than 60 characters')
        this.#name = value;
    }

    get description(): string {
        return this.#description;
    }
    set description(value: string) {
        if (value.length >= Project.MAX_DESCRIPTION_LENGTH)
            throw new Error('Project description cannot be longer than 200 characters')
        this.#description = value;
    }
}