import { Entity, ManyToOne } from "@mikro-orm/core";
import { Goal } from "./Goal.js";
import { ParsedRequirement } from "./ParsedRequirement.js";

/**
 * Obstacles are the challenges that prevent the goals from being achieved.
 */
@Entity()
export class Obstacle extends Goal {
    constructor({ follows, ...rest }: Omit<Obstacle, 'id'>) {
        super(rest);
        this.follows = follows;
    }

    /**
     * Requirement that this obstacle follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement, nullable: true })
    follows?: ParsedRequirement;
}