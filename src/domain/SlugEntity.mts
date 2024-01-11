import type { Properties } from '~/types/Properties.mjs';
import slugify from '~/lib/slugify.mjs';
import Entity from './Entity.mjs';

export default class SlugEntity extends Entity {
    static readonly maxNameLength = 60;
    static readonly maxDescriptionLength = 200;

    #name!: string;
    #description!: string;

    constructor(options: Properties<SlugEntity>) {
        super(options);
        this.name = options.name;
        this.description = options.description;
    }

    get name(): string {
        return this.#name;
    }

    set name(value: string) {
        const trimmed = value.trim(),
            Clazz = this.constructor as typeof SlugEntity;
        if (trimmed.length >= Clazz.maxNameLength)
            throw new Error('Entity name cannot be longer than 60 characters');
        this.#name = trimmed;
    }

    get description(): string {
        return this.#description;
    }

    set description(value: string) {
        const trimmed = value.trim(),
            Clazz = this.constructor as typeof SlugEntity;
        if (trimmed.length >= Clazz.maxDescriptionLength)
            throw new Error('Project description cannot be longer than 200 characters');
        this.#description = trimmed;
    }

    slug(): string {
        return slugify(this.name);
    }
}