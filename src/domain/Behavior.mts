import { Requirement, type RequirementJson } from "./Requirement.mjs";
import type Properties from "./types/Properties.mjs";

export interface BehaviorJson extends RequirementJson { }

export class Behavior extends Requirement {
    static override fromJSON(json: BehaviorJson): Behavior {
        return new Behavior({
            id: json.id as Behavior['id'],
            statement: json.statement
        })
    }

    constructor(options: Properties<Behavior>) {
        super(options)
    }
}