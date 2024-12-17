import { Component } from "./Component.js";
import { StakeholderCategory } from "./StakeholderCategory.js";
import { StakeholderSegmentation } from "./StakeholderSegmentation.js";

/**
 * A human actor who may affect or be affected by a project or its associated system
 */
export class Stakeholder extends Component {
    static override readonly reqIdPrefix = 'G.7.' as const;

    constructor(props: ConstructorParameters<typeof Component>[0] & Pick<Stakeholder, 'influence' | 'availability' | 'segmentation' | 'category'>) {
        super(props);
        this.influence = props.influence;
        this.availability = props.availability;
        this.segmentation = props.segmentation;
        this.category = props.category;
    }

    override get reqId() { return super.reqId as `${typeof Stakeholder.reqIdPrefix}${number}` | undefined }

    /**
     * The segmentation of the stakeholder.
     */
    readonly segmentation?: StakeholderSegmentation;

    /**
     * The category of the stakeholder.
     */
    readonly category?: StakeholderCategory;

    /**
     * The availability of the stakeholder.
     */
    readonly availability: number;

    /**
     * The influence of the stakeholder.
     */
    readonly influence: number;
}