import { Entity, ManyToOne } from "@mikro-orm/core";
import { ParsedRequirement, Requirement } from "./index.js";

/**
 * An Exclusion from the scope of requirements
 */
@Entity()
class Limit extends Requirement {
    constructor({ follows, ...rest }: Omit<Limit, 'id' | 'sysPeriod'>) {
        super(rest);
        this.follows = follows;
    }

    /**
     * Requirement that this limit follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement, nullable: true })
    follows?: ParsedRequirement;
}

export { Limit };