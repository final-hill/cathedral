import MoscowPriority from "./MoscowPriority.js";
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
    priority: MoscowPriority

    override toJSON() {
        return {
            ...super.toJSON(),
            priority: this.priority
        }
    }
}
