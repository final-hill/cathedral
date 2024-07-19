import Entity from "../Entity";
import { type Properties } from "../Properties";

/**
 * Represents a role in the Solution.
 */
export default class SolutionRole extends Entity<string> {
    constructor({ id, description }: Properties<SolutionRole>) {
        super({ id });
        this.description = description
    }

    /**
     * The description of the role.
     */
    description: string;
}