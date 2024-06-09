import PEGS from "~/domain/PEGS";
import type { Properties } from "~/domain/Properties";
import type { Uuid } from "~/domain/Uuid";

/**
 * The set of entities (human and non-human) external to the project
 * or system with the potential to affect it or be affected by it
 */
export default class Environment extends PEGS {
    constructor(properties: Properties<Environment>) {
        super(properties)

        this.assumptionIds = properties.assumptionIds
        this.constraintIds = properties.constraintIds
        this.effectIds = properties.effectIds
        this.invariantIds = properties.invariantIds
        this.glossaryTermIds = properties.glossaryTermIds
    }

    assumptionIds: Uuid[]
    constraintIds: Uuid[]
    effectIds: Uuid[]
    invariantIds: Uuid[]
    glossaryTermIds: Uuid[]
}
