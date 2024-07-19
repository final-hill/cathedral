import type { Properties } from "~/server/domain/requirements/Properties";
import PEGS from "~/server/domain/PEGS";
import type { Uuid } from "~/server/domain/Uuid";

/**
 * Goals are the needs and wants of an organization.
 * They are the things that the organization wants to achieve.
 */
export default class Goals extends PEGS {
    constructor({ goals, obstacles, outcomes, stakeholders, ...rest }: Properties<Goals>) {
        super(rest);

        this.goals = goals;
        this.obstacles = obstacles;
        this.outcomes = outcomes;
        this.stakeholders = stakeholders;
    }

    goals: Uuid[];
    obstacles: Uuid[];
    outcomes: Uuid[];
    stakeholders: Uuid[];

    override toJSON() {
        return {
            ...super.toJSON(),
            goals: this.goals,
            obstacles: this.obstacles,
            outcomes: this.outcomes,
            stakeholders: this.stakeholders
        }
    }
}
