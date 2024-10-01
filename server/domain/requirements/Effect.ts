import { ParsedRequirement, Requirement } from "./index.js";

/**
 * Environment property affected by the system
 */
export class Effect extends Requirement {
    constructor({ follows, ...rest }: Omit<Effect, 'id'>) {
        super(rest);
        this.follows = follows;
    }

    /**
     * Requirement that this effect follows from
     */
    follows?: ParsedRequirement;
}