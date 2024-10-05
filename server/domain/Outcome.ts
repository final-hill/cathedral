import { Entity, ManyToOne } from "@mikro-orm/core";
import { Goal, ParsedRequirement } from "./index.js";

/**
 * A result desired by an organization
 */
@Entity()
class Outcome extends Goal {
    constructor({ follows, ...rest }: Omit<Outcome, 'id' | 'sysPeriod'>) {
        super(rest);
        this.follows = follows;
    }

    /**
     * Requirement that this outcome follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement, nullable: true })
    follows?: ParsedRequirement;
}

export { Outcome };