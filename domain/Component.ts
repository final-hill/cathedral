import type { Properties } from "./Properties";
import type { Uuid } from "./Uuid";
import Actor from "./Actor";

/**
 * Idenfitication of a part (of the Project, Environment, Goals, or System)
 */
export default class Component extends Actor {
    constructor({ parentComponentId, functionalityId, ...rest }: Properties<Component>) {
        super(rest)

        this.parentComponentId = parentComponentId
        this.functionalityId = functionalityId
    }

    /**
     * The functionality of this component
     * @see FunctionalBehavior
     * @see NonFunctionalBehavior
     */
    functionalityId: Uuid

    /**
     * The parent component of this component
     */
    parentComponentId: Uuid
}
