import { Entity, ManyToOne } from "@mikro-orm/core";
import { ParsedRequirement, Requirement } from "./index.js";

/**
 * Environment property affected by the system
 */
@Entity()
class Effect extends Requirement {
    constructor({ follows, ...rest }: Omit<Effect, 'id' | 'sysPeriod'>) {
        super(rest);
        this.follows = follows;
    }

    /**
     * Requirement that this effect follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement, nullable: true })
    follows?: ParsedRequirement;
}

export { Effect };