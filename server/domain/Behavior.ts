import MoscowPriority from "./MoscowPriority.js";
import { Enum } from "@mikro-orm/core";
import { type Properties } from "./Properties.js";
import Requirement from "./Requirement.js";

/**
 * Property of the operation of the system
 */
export default abstract class Behavior extends Requirement {
    constructor({ priority, ...rest }: Omit<Properties<Behavior>, 'id'>) {
        super(rest)
        this.priority = priority
    }

    /**
     * The priority of the behavior.
     */
    @Enum(() => MoscowPriority)
    priority: MoscowPriority
}
