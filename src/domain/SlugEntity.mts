import type { Properties } from '~/types/Properties.mjs';
import slugify from '~/lib/slugify.mjs';
import { Entity } from './index.mjs';

export class SlugEntity extends Entity {
    static readonly maxNameLength = 60;
    static readonly maxDescriptionLength = 200;

    #name!: string;
    #description!: string;

    constructor({ id, name, description }: Properties<SlugEntity>) {
        super({ id });
        this.name = name;
        this.description = description;
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