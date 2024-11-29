import { Entity, Enum } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { MoscowPriority } from "./MoscowPriority.js";
import { ReqType } from "./ReqType.js";

/**
 * Property of the operation of the system
 */
@Entity({ discriminatorValue: ReqType.BEHAVIOR })
export class Behavior extends Requirement {
    static override req_type: ReqType = ReqType.BEHAVIOR;

    constructor({ priority, ...rest }: ConstructorParameters<typeof Requirement>[0] & Pick<Behavior, 'priority'>) {
        super(rest);
        this.priority = priority;
    }

    /**
     * The priority of the behavior.
     */
    @Enum({ items: () => MoscowPriority })
    priority: MoscowPriority;
}