import { Entity, Enum } from "@mikro-orm/core";
import { Requirement, MoscowPriority } from "./index.js";

/**
 * Property of the operation of the system
 */
@Entity({ abstract: true })
abstract class Behavior extends Requirement {
    constructor({ priority, ...rest }: Omit<Behavior, 'id' | 'sysPeriod'>) {
        super(rest);
        this.priority = priority;
    }

    /**
     * The priority of the behavior.
     */
    @Enum({ items: () => MoscowPriority, nullable: false })
    priority: MoscowPriority;
}

export { Behavior };