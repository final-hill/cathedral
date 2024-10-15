import { Entity, Enum } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { MoscowPriority } from "./MoscowPriority.js";

/**
 * Property of the operation of the system
 */
@Entity({ abstract: true })
export abstract class Behavior extends Requirement {
    constructor({ priority, ...rest }: Omit<Behavior, 'id'>) {
        super(rest);
        this.priority = priority;
    }

    /**
     * The priority of the behavior.
     */
    @Enum({ items: () => MoscowPriority })
    priority: MoscowPriority;
}