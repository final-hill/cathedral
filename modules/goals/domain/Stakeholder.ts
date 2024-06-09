import Actor from "~/domain/Actor";
import type { Properties } from "~/domain/Properties";

/**
 * The segmentation of a stakeholder according to their relationship with the organization
 */
export enum StakeholderSegmentation {
    Client = 'Client',
    Vendor = 'Vendor'
}

/**
 * The category of a stakeholder according to their level of influence and availability
 */
export enum StakeholderCategory {
    KeyStakeholder = 'Key Stakeholder',
    ShadowInfluencer = 'Shadow Influencer',
    FellowTraveler = 'Fellow Traveler',
    Observer = 'Observer'
}

/**
 * A human actor who may affect or be affected by a project or its associated system
 */
export default class Stakeholder extends Actor {
    static readonly INFLUENCE_MIN = 0
    static readonly INFLUENCE_MAX = 100
    static readonly AVAILABILITY_MIN = 0
    static readonly AVAILABILITY_MAX = 100

    private _influence!: number
    private _availability!: number

    segmentation!: StakeholderSegmentation

    constructor({ influence, availability, segmentation, ...rest }: Properties<Omit<Stakeholder, 'category'>>) {
        super(rest)

        Object.assign(this, { influence, availability, segmentation })
    }

    get availability(): number {
        return this._availability
    }
    set availability(value: number) {
        if (value < Stakeholder.AVAILABILITY_MIN || value > Stakeholder.AVAILABILITY_MAX)
            throw new Error(`Availability must be between ${Stakeholder.AVAILABILITY_MIN} and ${Stakeholder.AVAILABILITY_MAX}`)
        this._availability = value
    }

    get category(): StakeholderCategory {
        const { KeyStakeholder, ShadowInfluencer, FellowTraveler, Observer } = StakeholderCategory,
            { influence, availability } = this;

        return influence >= 75 && availability >= 75 ? KeyStakeholder
            : influence >= 75 && availability < 75 ? ShadowInfluencer
                : influence < 75 && availability >= 75 ? FellowTraveler
                    : Observer;
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
