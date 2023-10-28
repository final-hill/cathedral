import { Entity } from "./Entity";
import { Stakeholder } from "./Stakeholder";
import type { Properties } from "./types/Properties";

/**
 * A collection of stakeholders.
 * @see Stakeholder
 */
export class Stakeholders extends Entity {
    static override fromJSON(json: any): Stakeholders {
        return new Stakeholders({
            id: json.id,
            stakeholders: json.stakeholders.map(Stakeholder.fromJSON)
        })
    }

    private _stakeholders: Stakeholder[] = []

    constructor(options: Properties<Stakeholders>) {
        super(options)
        this._stakeholders = options.stakeholders
    }

    get stakeholders() {
        return this._stakeholders
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            stakeholders: this._stakeholders
        }
    }
}