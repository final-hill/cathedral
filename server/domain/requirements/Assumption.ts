import { ParsedRequirement, Requirement } from "./index.js";

/**
 * Posited property of the environment
 */
export class Assumption extends Requirement {
    constructor({ follows, ...rest }: Omit<Assumption, 'id'>) {
        super(rest);
        this.follows = follows;
    }

    /**
     * Requirement that this assumption follows from
     */
    follows?: ParsedRequirement
}