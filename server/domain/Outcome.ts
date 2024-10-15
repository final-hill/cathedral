import { Entity, ManyToOne } from "@mikro-orm/core";
import { Goal } from "./Goal.js";
import { ParsedRequirement } from "./ParsedRequirement.js";

/**
 * A result desired by an organization
 */
@Entity()
export class Outcome extends Goal {
    constructor({ follows, ...rest }: Omit<Outcome, 'id'>) {
        super(rest);
        this.follows = follows;
    }

    /**
     * Requirement that this outcome follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement })
    follows?: ParsedRequirement;
}