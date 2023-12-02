import type { Properties } from "~/types/Properties.mjs";
import { Requirement, type RequirementJson } from "./Requirement.mjs";

export interface BehaviorJson extends RequirementJson { }

export class Behavior extends Requirement {
    static override fromJSON({ id, statement }: BehaviorJson): Behavior {
        return new Behavior({ id, statement });
    }

    constructor(options: Properties<Behavior>) {
        super(options);
    }
}