import type { Properties } from "~/domain/Properties";
import Requirement from "~/domain/Requirement";
import type { Uuid } from "~/domain/Uuid";

/**
 * Property of the operation of the system
 */
export default class Behavior extends Requirement {
    componentId: Uuid

    constructor({ componentId, ...rest }: Properties<Behavior>) {
        super(rest)
        this.componentId = componentId
    }
}
