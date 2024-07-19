import type { Properties } from "~/server/domain/requirements/Properties"
import Entity from "~/server/domain/Entity"

/**
 * The segmentation of a stakeholder according to their relationship with the organization
 */
export default class StakeholderSegmentation extends Entity<string> {
    static CLIENT = new StakeholderSegmentation({ id: 'CLIENT', description: 'Client' })
    static VENDOR = new StakeholderSegmentation({ id: 'VENDOR', description: 'Vendor' })

    description: string;

    constructor({ id, description }: Properties<StakeholderSegmentation>) {
        super({ id })
        this.description = description
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            description: this.description
        }
    }
}
