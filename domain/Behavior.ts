import type { Properties } from "~/domain/Properties";
import Requirement from "~/domain/Requirement";
import type { Uuid } from "~/domain/Uuid";

/**
 * Property of the operation of the system
 */
export default class Behavior extends Requirement {
    componentId: Uuid

    /**
     * The priority of the behavior.
     */
    priorityId: string

    constructor({ componentId, priorityId, ...rest }: Properties<Behavior>) {
        super(rest)
        this.componentId = componentId
        this.priorityId = priorityId
    }
}
