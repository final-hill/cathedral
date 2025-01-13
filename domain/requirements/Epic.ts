import { Scenario } from "./Scenario.js";

/**
 * An Epic is a collection of Use Cases and User Stories all directed towards a common goal.
 * Ex: "decrease the percentage of of fraudulent sellers by 20%"
 */
export class Epic extends Scenario {
    static override readonly reqIdPrefix = 'G.5.' as const;

    constructor(props: ConstructorParameters<typeof Scenario>[0] & Pick<Epic, 'functionalBehaviorId'>) {
        super(props);
        this.functionalBehaviorId = props.functionalBehaviorId;
    }

    override get reqId() { return super.reqId as `${typeof Epic.reqIdPrefix}${number}` | undefined }

    /**
     * The action that the user wants to perform.
    */
    readonly functionalBehaviorId!: string;
}