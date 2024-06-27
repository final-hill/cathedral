import Entity from "~/domain/Entity"
import type { Properties } from "~/domain/Properties"

/**
 * The category of a stakeholder according to their level of influence and availability
 */
export default class StakeholderCategory extends Entity {
    name: string

    constructor({ name, ...rest }: Properties<StakeholderCategory>) {
        super(rest)
        this.name = name
    }
}
