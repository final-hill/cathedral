import { Entity, ManyToOne } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { ParsedRequirement } from "./ParsedRequirement.js";

/**
 * Environment property affected by the system
 */
@Entity()
export class Effect extends Requirement {
    constructor({ follows, ...rest }: Omit<Effect, 'id'>) {
        super(rest);
        this.follows = follows;
    }

    /**
     * Requirement that this effect follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement, nullable: true })
    follows?: ParsedRequirement;
}