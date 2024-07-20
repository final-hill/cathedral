import Component from "./Component.js";
import type { Properties } from "./Properties.js";
import { Check, Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";

export enum StakeholderSegmentation {
    CLIENT = 'Client',
    VENDOR = 'Vendor'
}

export enum StakeholderCategory {
    KEY_STAKEHOLDER = 'Key Stakeholder',
    SHADOW_INFLUENCER = 'Shadow Influencer',
    FELLOW_TRAVELER = 'Fellow Traveler',
    OBSERVER = 'Observer'
}

/**
 * A human actor who may affect or be affected by a project or its associated system
 */
@Entity()
export default class Stakeholder extends Component {
    constructor({ influence, availability, segmentation, category, parentComponent, ...rest }: Omit<Properties<Stakeholder>, 'id'>) {
        super(rest)

        this.influence = influence
        this.availability = availability
        this.segmentation = segmentation
        this.category = category
        this.parentComponent = parentComponent
    }

    @ManyToOne()
    parentComponent?: Stakeholder

    @Enum(() => StakeholderSegmentation)
    segmentation: StakeholderSegmentation

    @Enum(() => StakeholderCategory)
    category: StakeholderCategory

    @Property()
    @Check({ expression: 'availability >= 0 AND availability <= 100' })
    availability: number

    @Property()
    @Check({ expression: 'influence >= 0 AND influence <= 100' })
    influence: number
}
