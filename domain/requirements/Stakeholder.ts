import { Component } from "./Component.js";
import { StakeholderCategory } from "./StakeholderCategory.js";
import { StakeholderSegmentation } from "./StakeholderSegmentation.js";
import { ReqType } from "./ReqType.js";

/**
 * A human actor who may affect or be affected by a project or its associated system
 */
export class Stakeholder extends Component {
    static override reqIdPrefix = 'G.7.' as const;
    static override req_type: ReqType = ReqType.STAKEHOLDER;

    constructor(props: ConstructorParameters<typeof Component>[0] & Pick<Stakeholder, 'influence' | 'availability' | 'segmentation' | 'category'>) {
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