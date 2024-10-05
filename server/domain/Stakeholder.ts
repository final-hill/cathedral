import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";
import { Component, ParsedRequirement, StakeholderCategory, StakeholderSegmentation } from "./index.js";

/**
 * A human actor who may affect or be affected by a project or its associated system
 */
@Entity()
class Stakeholder extends Component {
    constructor({ influence, availability, segmentation, category, parentComponent, follows, ...rest }: Omit<Stakeholder, 'id' | 'sysPeriod'>) {
        super(rest);

        this.influence = influence;
        this.availability = availability;
        this.segmentation = segmentation;
        this.category = category;
        this.parentComponent = parentComponent;
        this.follows = follows;
    }

    /**
     * Requirement that this stakeholder follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement, nullable: true })
    follows?: ParsedRequirement;

    /**
     * The parent component of the stakeholder, if any.
     */
    @ManyToOne({ entity: () => Stakeholder, nullable: true })
    parentComponent?: Stakeholder;

    /**
     * The segmentation of the stakeholder.
     */
    @Enum({ items: () => StakeholderSegmentation, nullable: true })
    segmentation?: StakeholderSegmentation;

    /**
     * The category of the stakeholder.
     */
    @Enum({ items: () => StakeholderCategory, nullable: true })
    category?: StakeholderCategory;

    /**
     * The availability of the stakeholder.
     */
    @Property({ type: 'number', nullable: false, check: 'availability >= 0 AND availability <= 100' })
    availability: number;

    /**
     * The influence of the stakeholder.
     */
    @Property({ type: 'number', nullable: false, check: 'influence >= 0 AND influence <= 100' })
    influence: number;
}

export { Stakeholder };