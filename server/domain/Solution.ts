import { v7 as uuid7 } from 'uuid';
import { Entity, PrimaryKey, Property, types } from "@mikro-orm/core"

/**
 * A Solution is the aggregation of a Project, Environment, Goals, and a System
 */
@Entity()
export default class Solution {
    static readonly maxNameLength = 60;
    static readonly maxDescriptionLength = 200;

    #description!: string;
    #name!: string;
    #slug!: string;

    @PrimaryKey({ type: types.uuid })
    id: string = uuid7();

    /**
     * The name of the Solution
     * @throws {Error} if the name is longer than 60 characters
     */
    @Property({ type: types.string, length: Solution.maxNameLength })
    get name(): string { return this.#name; }

    set name(value: string) {
        const trimmed = value.trim();
        if (trimmed.length >= Solution.maxNameLength)
            throw new Error(`Entity name cannot be longer than ${Solution.maxNameLength} characters`);
        this.#name = trimmed;
    }

    /**
     * The description of the Solution
     * @throws {Error} if the description is longer than 200 characters
     */
    @Property({ type: types.string, length: Solution.maxDescriptionLength })
    get description(): string { return this.#description; }

    set description(value: string) {
        const trimmed = value.trim();
        if (trimmed.length >= Solution.maxDescriptionLength)
            throw new Error(
                `Project description cannot be longer than ${Solution.maxDescriptionLength} characters`
            );
        this.#description = trimmed;
    }
}