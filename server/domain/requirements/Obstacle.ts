import { Goal, ParsedRequirement } from "./index.js";

/**
 * Obstacles are the challenges that prevent the goals from being achieved.
 */
export class Obstacle extends Goal {
    constructor({ follows, ...rest }: Omit<Obstacle, 'id'>) {
        super(rest);
        this.follows = follows;
    }

    /**
     * Requirement that this obstacle follows from
     */
    follows?: ParsedRequirement;
}