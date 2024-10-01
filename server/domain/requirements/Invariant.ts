import { ParsedRequirement, Requirement } from "./index.js";

/**
 * Environment property that must be maintained.
 * It exists as both an assumption and an effect.
 * (precondition and postcondition)
 */
export class Invariant extends Requirement {
    constructor({ follows, ...rest }: Omit<Invariant, 'id'>) {
        super(rest);
        this.follows = follows;
    }

    /**
     * Requirement that this invariant follows from
     */
    follows?: ParsedRequirement;
}