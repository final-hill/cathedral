import type { Properties } from "~/domain/Properties"
import Entity from "~/domain/Entity"

/**
 * The segmentation of a stakeholder according to their relationship with the organization
 */
export default class StakeholderSegmentation extends Entity {
    name: string

    constructor({ name, ...rest }: Properties<StakeholderSegmentation>) {
        super(rest)
        this.name = name
    }
}
