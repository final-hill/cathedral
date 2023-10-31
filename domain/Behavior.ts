import { Requirement, type RequirementJson } from "./Requirement";
import type { Properties } from "./types/Properties";

export interface BehaviorJson extends RequirementJson { }

export class Behavior extends Requirement {
    static override fromJSON(json: BehaviorJson): Behavior {
        return new Behavior({
            id: json.id,
            statement: json.statement
        })
    }

    constructor(options: Properties<Behavior>) {
        super(options)
    }
}