import Component from "./Component.js";
import type { Properties } from "./Properties.js";
import StakeholderCategory from "./StakeholderCategory.js";
import StakeholderSegmentation from "./StakeholderSegmentation.js";

/**
 * A human actor who may affect or be affected by a project or its associated system
 */
export default class Stakeholder extends Component {
    constructor({ influence, availability, segmentation, category, parentComponent, ...rest }: Omit<Properties<Stakeholder>, 'id'>) {
        super(rest)

        this.influence = influence
        this.availability = availability
        this.segmentation = segmentation
        this.category = category
        this.parentComponent = parentComponent
    }

    parentComponent?: Stakeholder

    segmentation: StakeholderSegmentation

    category: StakeholderCategory

    availability: number

    influence: number

    override toJSON() {
        return {
            ...super.toJSON(),
            parentComponentId: this.parentComponent?.id,
            segmentation: this.segmentation,
            category: this.category,
            availability: this.availability,
            influence: this.influence
        }
    }
}