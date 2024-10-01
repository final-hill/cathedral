import { ParsedRequirement, Requirement } from "./index.js";

/**
 * An Exclusion from the scope of requirements
 */
export class Limit extends Requirement {
    constructor({ follows, ...rest }: Omit<Limit, 'id'>) {
        super(rest);
        this.follows = follows;
    }

    /**
     * Requirement that this limit follows from
     */
    follows?: ParsedRequirement;
}