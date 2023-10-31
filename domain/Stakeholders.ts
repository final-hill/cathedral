import { Entity, type EntityJson } from "./Entity";
import { Stakeholder, type StakeholderJson } from "./Stakeholder";
import type { Properties } from "./types/Properties";

export interface StakeholdersJson extends EntityJson {
    stakeholders: StakeholderJson[]
}

/**
 * A collection of stakeholders.
 * @see Stakeholder
 */
export class Stakeholders extends Entity {
    static override fromJSON(json: StakeholdersJson): Stakeholders {
        return new Stakeholders({
            id: json.id,
            stakeholders: json.stakeholders.map(Stakeholder.fromJSON)
        })
    }

    stakeholders: Stakeholder[]

    constructor(options: Properties<Stakeholders>) {
        super(options)
        this.stakeholders = options.stakeholders
    }

    override toJSON(): StakeholdersJson {
        return {
            ...super.toJSON(),
            stakeholders: this.stakeholders
        }
    }
}