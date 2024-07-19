import Entity from "../Entity";
import type { Properties } from "../Properties";

/**
 * An Organization is a collection of people and solutions
 */
export default class Organization extends Entity {
    static readonly maxNameLength = 60;
    static readonly maxDescriptionLength = 200;

    private _description!: string;
    private _name!: string;
    private _slug!: string;

    constructor({ id, ...rest }: Properties<Organization>) {
        super({ id });
        Object.assign(this, rest);
    }

    /**
     * The description of the Organization
     * @throws {Error} if the description is longer than 200 characters
     */
    get description(): string { return this._description; }

    set description(value: string) {
        const trimmed = value.trim();
        if (trimmed.length >= Organization.maxDescriptionLength)
            throw new Error(
                `Organization description cannot be longer than ${Organization.maxDescriptionLength} characters`
            );
        this._description = trimmed;
    }

    /**
     * The name of the Organization
     * @throws {Error} if the name is longer than 60 characters
     */
    get name(): string { return this._name; }

    set name(value: string) {
        const trimmed = value.trim();
        if (trimmed.length >= Organization.maxNameLength)
            throw new Error(`Entity name cannot be longer than ${Organization.maxNameLength} characters`);
        this._name = trimmed;
    }

    get slug(): string {
        return this._slug
    }
    set slug(value: string) {
        this._slug = value
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            description: this.description,
            name: this.name,
            slug: this.slug
        }
    }
}