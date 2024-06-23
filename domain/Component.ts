import type { Properties } from "./Properties";
import type { Uuid } from "./Uuid";
import Actor from "./Actor";

/**
 * Idenfitication of a part (of the Project, Environment, Goals, or System)
 */
export default class Component extends Actor {
    constructor({ parentComponentId, ...rest }: Properties<Component>) {
        super(rest)

        this.parentComponentId = parentComponentId
    }

    parentComponentId: Uuid
}
