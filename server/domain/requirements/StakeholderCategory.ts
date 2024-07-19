import Entity from "~/server/domain/Entity"
import type { Properties } from "~/server/domain/requirements/Properties"

/**
 * The category of a stakeholder according to their level of influence and availability
 */
export default class StakeholderCategory extends Entity<string> {
    static KEY_STAKEHOLDER = new StakeholderCategory({ id: 'KEY_STAKEHOLDER', description: 'Key Stakeholder' })
    static SHADOW_INFLUENCER = new StakeholderCategory({ id: 'SHADOW_INFLUENCER', description: 'Shadow Influencer' })
    static FELLOW_TRAVELER = new StakeholderCategory({ id: 'FELLOW_TRAVELER', description: 'Fellow Traveler' })
    static OBSERVER = new StakeholderCategory({ id: 'OBSERVER', description: 'Observer' })

    description: string

    constructor({ description, ...rest }: Properties<StakeholderCategory>) {
        super(rest)
        this.description = description
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            description: this.description
        }
    }
}
