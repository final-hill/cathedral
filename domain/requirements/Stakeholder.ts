import { Entity, Enum, Property } from "@mikro-orm/core";
import { Component } from "./Component.js";
import { StakeholderCategory } from "./StakeholderCategory.js";
import { StakeholderSegmentation } from "./StakeholderSegmentation.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

export const stakeholderReqIdPrefix = 'G.7.' as const;
export type StakeholderReqId = `${typeof stakeholderReqIdPrefix}${number}`;

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
    }

    override get reqId(): StakeholderReqId | undefined { return super.reqId as StakeholderReqId | undefined }
    override set reqId(value: StakeholderReqId | undefined) { super.reqId = value }

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