import { Scenario } from "./Scenario.js";
import { FunctionalBehavior } from "./FunctionalBehavior.js";

/**
 * An Epic is a collection of Use Cases and User Stories all directed towards a common goal.
 * Ex: "decrease the percentage of of fraudulent sellers by 20%"
 */
export class Epic extends Scenario {
    static override readonly reqIdPrefix = 'G.5.' as const;

    constructor(props: ConstructorParameters<typeof Scenario>[0] & Pick<Epic, 'functionalBehavior'>) {
        super(props);
        this.functionalBehavior = props.functionalBehavior;
    }

    override get reqId() { return super.reqId as `${typeof Epic.reqIdPrefix}${number}` | undefined }

    /**
     * The action that the user wants to perform.
    */
    readonly functionalBehavior!: FunctionalBehavior;
}