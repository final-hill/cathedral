import { Behavior } from "./Behavior";
import { PEGS } from "./PEGS";
import { Stakeholders } from "./Stakeholders";
import type { Properties } from "./types/Properties";

/**
 * Goals are the needs and wants of an organization.
 * They are the things that the organization wants to achieve.
 */
export class Goals extends PEGS {
    static override STORAGE_KEY = 'goals';

    static override fromJSON(json: any): Goals {
        return new Goals({
            functionalBehaviors: json.behaviors.map(Behavior.fromJSON),
            id: json.id,
            description: json.description,
            name: json.name,
            objective: json.objective,
            outcomes: json.outcomes,
            situation: json.situation,
            stakeholders: Stakeholders.fromJSON(json.stakeholders)
        })
    }

    private _functionalBehaviors
    private _objective
    private _outcomes
    private _stakeholders
    private _situation

    constructor(options: Properties<Goals>) {
        super(options)
        this._functionalBehaviors = options.functionalBehaviors
        this._objective = options.objective
        this._outcomes = options.outcomes
        this._stakeholders = options.stakeholders
        this._situation = options.situation
    }

    /**
     * Functional behaviors specify what results or effects are expected from the system.
     * They specify "what" the system should do, not "how" it should do it.
     */
    get functionalBehaviors(): Behavior[] {
        return this._functionalBehaviors
    }
    set functionalBehaviors(behaviors: Behavior[]) {
        this._functionalBehaviors = behaviors
    }

    get objective(): string {
        return this._objective
    }
    set objective(objective: string) {
        this._objective = objective
    }

    get outcomes(): string {
        return this._outcomes
    }
    set outcomes(outcomes: string) {
        this._outcomes = outcomes
    }

    get situation(): string {
        return this._situation
    }
    set situation(situation: string) {
        this._situation = situation
    }

    get stakeholders(): Stakeholders {
        return this._stakeholders
    }

    toJSON() {
        return {
            ...super.toJSON(),
            behaviors: this._functionalBehaviors,
            objective: this._objective,
            outcomes: this._outcomes,
            situation: this._situation,
            stakeholders: this._stakeholders.toJSON()
        }
    }
}