import { Requirement } from "./Requirement";

/**
 * A result desired by an organization.
 * an objective of the project or system, in terms
 * of their desired effect on the environment
 */
export class Goal extends Requirement {
    static override fromJSON(json: any): Goal {
        return new Goal({
            id: json.id,
            statement: json.statement
        })
    }
    override toJSON(): any {
        return {
            ...super.toJSON()
        }
    }
}