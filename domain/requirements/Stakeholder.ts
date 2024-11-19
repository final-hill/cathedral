import { Entity, Enum, Property } from "@mikro-orm/core";
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
    static override reqIdPrefix = 'G.7.' as const;
    static override req_type: ReqType = ReqType.STAKEHOLDER;

    constructor(props: Properties<Omit<Stakeholder, 'id' | 'req_type'>>) {
        super(props);
        this.influence = props.influence;
        this.availability = props.availability;
        this.segmentation = props.segmentation;
        this.category = props.category;
    }

    override get reqId() { return super.reqId as `${typeof Stakeholder.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }

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