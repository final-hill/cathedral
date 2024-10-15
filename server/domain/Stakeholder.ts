import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";
import { Component } from "./Component.js";
import { ParsedRequirement } from "./ParsedRequirement.js";
import { StakeholderCategory } from "./StakeholderCategory.js";
import { StakeholderSegmentation } from "./StakeholderSegmentation.js";

/**
 * A human actor who may affect or be affected by a project or its associated system
 */
@Entity()
export class Stakeholder extends Component {
    constructor({ influence, availability, segmentation, category, parentComponent, follows, ...rest }: Omit<Stakeholder, 'id'>) {
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
    @ManyToOne({ entity: () => ParsedRequirement })
    follows?: ParsedRequirement;

    /**
     * The parent component of the stakeholder, if any.
     */
    @ManyToOne({ entity: () => Stakeholder })
    parentComponent?: Stakeholder;

    /**
     * The segmentation of the stakeholder.
     */
    @Enum({ items: () => StakeholderSegmentation })
    segmentation?: StakeholderSegmentation;

    /**
     * The category of the stakeholder.
     */
    @Enum({ items: () => StakeholderCategory })
    category?: StakeholderCategory;

    /**
     * The availability of the stakeholder.
     */
    @Property({ type: 'number', check: 'availability >= 0 AND availability <= 100' })
    availability: number;

    /**
     * The influence of the stakeholder.
     */
    @Property({ type: 'number', check: 'influence >= 0 AND influence <= 100' })
    influence: number;
}