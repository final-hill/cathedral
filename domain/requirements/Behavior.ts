import { Requirement } from "./Requirement.js";
import { MoscowPriority } from "./MoscowPriority.js";
import { ReqType } from "./ReqType.js";

/**
 * Property of the operation of the system
 */
export class Behavior extends Requirement {
    static override req_type: ReqType = ReqType.BEHAVIOR;

    constructor({ priority, ...rest }: ConstructorParameters<typeof Requirement>[0] & Pick<Behavior, 'priority'>) {
        super(rest);
        this.priority = priority;
    }

    /**
     * The priority of the behavior.
     */
    priority: MoscowPriority;
}