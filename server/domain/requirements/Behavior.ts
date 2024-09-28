import type { Properties } from "../Properties.js";
import { Requirement, type MoscowPriority } from "./index.js";

/**
 * Property of the operation of the system
 */
export abstract class Behavior extends Requirement {
    constructor({ priority, ...rest }: Omit<Properties<Behavior>, 'id'>) {
        super(rest);
        this.priority = priority;
    }

    /**
     * The priority of the behavior.
     */
    priority: MoscowPriority;
}
