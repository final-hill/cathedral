import Entity from "~/domain/Entity.js";
import type { Properties } from "../../../domain/Properties.js";
import type { Uuid } from "../../../domain/Uuid.js";
import slugify from "~/lib/slugify.js";

/**
 * A Solution is the aggregation of a Project, Environment, Goals, and a System
 */
export default class Solution extends Entity {
    static readonly maxNameLength = 60;
    static readonly maxDescriptionLength = 200;

    private _description!: string;
    private _name!: string;
    private _slug!: string;

    constructor({ id, ...rest }: Properties<Solution>) {
        super({ id });
        Object.assign(this, rest);
    }

    /**
     * The description of the Solution
     * @throws {Error} if the description is longer than 200 characters
     */
    get description(): string { return this._description; }

    set description(value: string) {
        const trimmed = value.trim();
        if (trimmed.length >= Solution.maxDescriptionLength)
            throw new Error(
                `Project description cannot be longer than ${Solution.maxDescriptionLength} characters`
            );
        this._description = trimmed;
    }

    /**
     * The name of the Solution
     * @throws {Error} if the name is longer than 60 characters
     */
    get name(): string { return this._name; }

    set name(value: string) {
        const trimmed = value.trim();
        if (trimmed.length >= Solution.maxNameLength)
            throw new Error(`Entity name cannot be longer than ${Solution.maxNameLength} characters`);
        this._name = trimmed;
    }

    get slug(): string {
        return this._slug
    }

    set slug(value: string) {
        this._slug = value
    }
}