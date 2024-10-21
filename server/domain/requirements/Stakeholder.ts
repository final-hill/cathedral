import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";
import { Component } from "./Component.js";
import { StakeholderCategory } from "./StakeholderCategory.js";
import { StakeholderSegmentation } from "./StakeholderSegmentation.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * A human actor who may affect or be affected by a project or its associated system
 */
@Entity({ discriminatorValue: ReqType.STAKEHOLDER })
export class Stakeholder extends Component {
    constructor(props: Properties<Omit<Stakeholder, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.STAKEHOLDER;
        this.influence = props.influence;
        this.availability = props.availability;
        this.segmentation = props.segmentation;
        this.category = props.category;
        this.parentComponent = props.parentComponent;
    }

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