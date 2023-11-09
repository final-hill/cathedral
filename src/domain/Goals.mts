import { Behavior } from "./Behavior.mjs";
import { Uuid } from "./Entity.mjs";
import { PEGS, type PEGSJson } from "./PEGS.mjs";
import { Stakeholders, type StakeholdersJson } from "./Stakeholders.mjs";
import type Properties from "./types/Properties.mjs";

export interface GoalsJson extends PEGSJson {
    functionalBehaviors: Uuid[];
    objective: string;
    outcomes: string;
    situation: string;
    stakeholders: StakeholdersJson;
}

/**
 * Goals are the needs and wants of an organization.
 * They are the things that the organization wants to achieve.
 */
export class Goals extends PEGS {
    static override fromJSON(json: GoalsJson): Goals {
        return new Goals({
            functionalBehaviors: json.functionalBehaviors,
            id: json.id as Goals['id'],
            description: json.description,
            name: json.name,
            objective: json.objective,
            outcomes: json.outcomes,
            situation: json.situation,
            stakeholders: Stakeholders.fromJSON(json.stakeholders)
        })
    }

    /**
     * Functional behaviors specify what results or effects are expected from the system.
     * They specify "what" the system should do, not "how" it should do it.
     */
    functionalBehaviors: Uuid[]
    objective: string
    outcomes: string
    stakeholders: Stakeholders
    situation: string

    constructor(options: Properties<Goals>) {
        super(options)
        this.functionalBehaviors = options.functionalBehaviors
        this.objective = options.objective
        this.outcomes = options.outcomes
        this.stakeholders = options.stakeholders
        this.situation = options.situation
    }

    toJSON(): GoalsJson {
        return {
            ...super.toJSON(),
            functionalBehaviors: this.functionalBehaviors,
            objective: this.objective,
            outcomes: this.outcomes,
            situation: this.situation,
            stakeholders: this.stakeholders.toJSON()
        }
    }
}