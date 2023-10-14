import { PEGS } from "./PEGS";
import { Stakeholders } from "./Stakeholders";

export interface GoalsOptions {
    id?: string
    name: string
    description?: string
    stakeholders: Stakeholders
}

/**
 * Goals are the needs and wants of an organization.
 * They are the things that the organization wants to achieve.
 */
export class Goals extends PEGS {
    private _stakeholders

    constructor({ id, name, description, stakeholders }: GoalsOptions) {
        super({ id, name, description })
        this._stakeholders = stakeholders
    }

    get stakeholders(): Stakeholders {
        return this._stakeholders
    }
}