import { Behavior, type BehaviorJson } from "./Behavior";
import { PEGS, type PEGSJson } from "./PEGS";
import { Stakeholders, type StakeholdersJson } from "./Stakeholders";
import type { Properties } from "./types/Properties";

export interface GoalsJson extends PEGSJson {
    functionalBehaviors: BehaviorJson[];
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
    static override STORAGE_KEY = 'goals';

    static override fromJSON(json: GoalsJson): Goals {
        return new Goals({
            functionalBehaviors: json.functionalBehaviors.map(Behavior.fromJSON),
            id: json.id,
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
    functionalBehaviors: Behavior[]
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
            functionalBehaviors: this.functionalBehaviors.map(behavior => behavior.toJSON()),
            objective: this.objective,
            outcomes: this.outcomes,
            situation: this.situation,
            stakeholders: this.stakeholders.toJSON()
        }
    }
}