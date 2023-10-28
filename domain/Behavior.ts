import { Requirement } from "./Requirement";
import type { Properties } from "./types/Properties";

export class Behavior extends Requirement {
    static override fromJSON(json: any): Behavior {
        return new Behavior({
            id: json.id,
            statement: json.statement
        })
    }

    constructor(options: Properties<Behavior>) {
        super(options)
    }

    override toJSON(): any {
        return {
            ...super.toJSON()
        }
    }
}