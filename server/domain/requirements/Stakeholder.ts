import { Component, ParsedRequirement, StakeholderCategory, StakeholderSegmentation } from "./index.js";

export interface IStakeholder {
    influence: number
    availability: number
    segmentation: StakeholderSegmentation
    category: StakeholderCategory
    parentComponent: Stakeholder
}

/**
 * A human actor who may affect or be affected by a project or its associated system
 */
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
    follows?: ParsedRequirement;

    /**
     * The parent component of the stakeholder, if any.
     */
    parentComponent?: Stakeholder;

    /**
     * The segmentation of the stakeholder.
     */
    segmentation?: StakeholderSegmentation;

    /**
     * The category of the stakeholder.
     */
    category?: StakeholderCategory;

    /**
     * The availability of the stakeholder.
     */
    availability: number;

    /**
     * The influence of the stakeholder.
     */
    influence: number;
}