import { Requirement, type RequirementJson } from "./Requirement.mjs";

export interface GoalJson extends RequirementJson { }

/**
 * A result desired by an organization.
 * an objective of the project or system, in terms
 * of their desired effect on the environment
 */
export class Goal extends Requirement {
    static override fromJSON({ id, statement }: GoalJson): Goal {
        return new Goal({ id, statement });
    }

    override toJSON(): GoalJson {
        return {
            ...super.toJSON()
        };
    }
}