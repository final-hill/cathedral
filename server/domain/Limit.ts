import { Entity, ManyToOne } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { ParsedRequirement } from "./ParsedRequirement.js";

/**
 * An Exclusion from the scope of requirements
 */
@Entity()
export class Limit extends Requirement {
    constructor({ follows, ...rest }: Omit<Limit, 'id'>) {
        super(rest);
        this.follows = follows;
    }

    /**
     * Requirement that this limit follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement, nullable: true })
    follows?: ParsedRequirement;
}