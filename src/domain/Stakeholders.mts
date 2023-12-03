import type { Properties } from "~/types/Properties.mjs";
import { Entity, type EntityJson } from "./Entity.mjs";
import { Stakeholder, type StakeholderJson } from "./Stakeholder.mjs";

export interface StakeholdersJson extends EntityJson {
    stakeholders: StakeholderJson[];
}

/**
 * A collection of stakeholders.
 * @see Stakeholder
 */
export class Stakeholders extends Entity {
    static override fromJSON({ id, stakeholders }: StakeholdersJson): Stakeholders {
        return new Stakeholders({
            id,
            stakeholders: stakeholders.map(Stakeholder.fromJSON)
        });
    }

    stakeholders: Stakeholder[];

    /**
     * Creates a new Stakeholders instance.
     */
    constructor(options: Properties<Stakeholders>) {
        super(options);
        this.stakeholders = options.stakeholders;
    }

    override toJSON(): StakeholdersJson {
        return {
            ...super.toJSON(),
            stakeholders: this.stakeholders.map(s => s.toJSON())
        };
    }
}

export default Stakeholders;
