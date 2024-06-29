import type { Properties } from "~/domain/Properties";
import Requirement from "~/domain/Requirement";
import type MoscowPriority from "./MoscowPriority";

/**
 * Property of the operation of the system
 */
export default class Behavior extends Requirement {
    /**
     * The priority of the behavior.
     */
    priorityId: keyof Omit<typeof MoscowPriority, 'prototype'>

    constructor({ priorityId, ...rest }: Properties<Behavior>) {
        super(rest)
        this.priorityId = priorityId
    }
}
