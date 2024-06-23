import Component from "~/domain/Component";
import type { Properties } from "~/domain/Properties";
import type { Uuid } from "~/domain/Uuid";

/**
 * A human actor who may affect or be affected by a project or its associated system
 */
export default class Stakeholder extends Component {
    static readonly INFLUENCE_MIN = 0
    static readonly INFLUENCE_MAX = 100
    static readonly AVAILABILITY_MIN = 0
    static readonly AVAILABILITY_MAX = 100

    private _influence!: number
    private _availability!: number

    segmentationId!: Uuid
    categoryId!: Uuid

    constructor({ influence, availability, segmentationId, categoryId, ...rest }: Properties<Stakeholder>) {
        super(rest)

        Object.assign(this, { influence, availability, segmentationId, categoryId })
    }

    get availability(): number {
        return this._availability
    }
    set availability(value: number) {
        if (value < Stakeholder.AVAILABILITY_MIN || value > Stakeholder.AVAILABILITY_MAX)
            throw new Error(`Availability must be between ${Stakeholder.AVAILABILITY_MIN} and ${Stakeholder.AVAILABILITY_MAX}`)
        this._availability = value
    }

    get influence(): number {
        return this._influence
    }
    set influence(value: number) {
        if (value < Stakeholder.INFLUENCE_MIN || value > Stakeholder.INFLUENCE_MAX)
            throw new Error(`Influence must be between ${Stakeholder.INFLUENCE_MIN} and ${Stakeholder.INFLUENCE_MAX}`)
        this._influence = value
    }
}
