import { MetaRequirement, ParsedRequirement } from "./index.js";

/**
 * Explanation of a project or system property in reference to a goal or environment property
 */
export class Justification extends MetaRequirement {
    constructor({ follows, ...rest }: Omit<Justification, 'id'>) {
        super(rest);
        this.follows = follows;
    }

    /**
     * Requirement that this justification follows from
     */
    follows?: ParsedRequirement;
}