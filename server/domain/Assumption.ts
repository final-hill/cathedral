import { Entity, ManyToOne } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { ParsedRequirement } from "./ParsedRequirement.js";

/**
 * Posited property of the environment
 */
@Entity()
export class Assumption extends Requirement {
    constructor({ follows, ...rest }: Omit<Assumption, 'id'>) {
        super(rest);
        this.follows = follows;
    }

    /**
     * Requirement that this assumption follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement })
    follows?: ParsedRequirement
}