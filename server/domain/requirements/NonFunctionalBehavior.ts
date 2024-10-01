import { Functionality, ParsedRequirement } from "./index.js";

/**
 * NonFunctionalBehavior is a type of Behavior that is not directly related to the functionality of a system.
 * It specifies **how** the system should behave, i.e., the qualities that the system must exhibit.
 * Generally expressed in the form "system shall be <requirement>."
 */
export class NonFunctionalBehavior extends Functionality {
    constructor({ follows, ...rest }: Omit<NonFunctionalBehavior, 'id'>) {
        super(rest);
        this.follows = follows;
    }

    /**
     * Requirement that this non-functional behavior follows from
     */
    follows?: ParsedRequirement;
}