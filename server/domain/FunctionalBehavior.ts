import { Entity, ManyToOne } from "@mikro-orm/core";
import { Functionality, ParsedRequirement } from "./index.js";

/**
 * FunctionalBehavior specifies **what** behavior the system should exhibit, i.e.,
 * the results or effects of the system's operation.
 * Generally expressed in the form "system must do <requirement>"
 */
@Entity()
class FunctionalBehavior extends Functionality {
    constructor({ follows, ...rest }: Omit<FunctionalBehavior, 'id'>) {
        super(rest);
        this.follows = follows;
    }

    /**
     * Requirement that this functional behavior follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement, nullable: true })
    follows?: ParsedRequirement;
}

export { FunctionalBehavior };