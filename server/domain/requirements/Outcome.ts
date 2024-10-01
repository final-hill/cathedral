import { Goal, ParsedRequirement } from "./index.js";

/**
 * A result desired by an organization
 */
export class Outcome extends Goal {
    constructor({ follows, ...rest }: Omit<Outcome, 'id'>) {
        super(rest);
        this.follows = follows;
    }

    /**
     * Requirement that this outcome follows from
     */
    follows?: ParsedRequirement;
}