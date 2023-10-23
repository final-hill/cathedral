import { PEGS } from "./PEGS";
import { Stakeholders } from "./Stakeholders";

export interface GoalsOptions {
    id?: string
    name: string
    objective?: string
    description?: string
    outcomes?: string
    situation?: string
    stakeholders: Stakeholders
}

/**
 * Goals are the needs and wants of an organization.
 * They are the things that the organization wants to achieve.
 */
export class Goals extends PEGS {
    private _objective
    private _stakeholders
    private _situation
    private _outcomes

    constructor(options: GoalsOptions) {
        super({ id: options.id, name: options.name, description: options.description })
        this._objective = options.objective ?? ''
        this._stakeholders = options.stakeholders
        this._situation = options.situation ?? ''
        this._outcomes = options.outcomes ?? ''
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
}