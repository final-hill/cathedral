import { Entity } from "./Entity";
import { Stakeholder } from "./Stakeholder";

export class Stakeholders extends Entity<string> {
    private _id: string
    private _stakeholders: Stakeholder[] = []

    constructor({ id, stakeholders }: { id?: string, stakeholders?: Stakeholder[] }) {
        super()
        this._id = id || self.crypto.randomUUID()
        this._stakeholders = stakeholders ?? []
    }

    get id() {
        return this._id
    }

    get stakeholders() {
        return this._stakeholders
    }
}