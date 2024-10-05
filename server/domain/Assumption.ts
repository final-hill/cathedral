import { Entity, ManyToOne } from "@mikro-orm/core";
import { ParsedRequirement, Requirement } from "./index.js";

/**
 * Posited property of the environment
 */
@Entity()
class Assumption extends Requirement {
    constructor({ follows, ...rest }: Omit<Assumption, 'id' | 'sysPeriod'>) {
        super(rest);
        this.follows = follows;
    }

    /**
     * Requirement that this assumption follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement, nullable: true })
    follows?: ParsedRequirement
}

export { Assumption };