import { Entity, ManyToOne } from "@mikro-orm/core";
import { ParsedRequirement, Requirement } from "./index.js";

/**
 * Environment property that must be maintained.
 * It exists as both an assumption and an effect.
 * (precondition and postcondition)
 */
@Entity()
class Invariant extends Requirement {
    constructor({ follows, ...rest }: Omit<Invariant, 'id'>) {
        super(rest);
        this.follows = follows;
    }

    /**
     * Requirement that this invariant follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement, nullable: true })
    follows?: ParsedRequirement;
}

export { Invariant };