import { StakeholderCategory } from './StakeholderCategory.js'

/**
 * Compute the stakeholder category based on interest and influence values.
 * This is a derived field that categorizes stakeholders into one of four quadrants.
 * @param props - The stakeholder properties
 * @param props.interest - The interest level (0-100)
 * @param props.influence - The influence level (0-100)
 * @returns The computed stakeholder category
 */
export function computeStakeholderCategory({ interest, influence }: { interest: number, influence: number }): StakeholderCategory {
    const isHighInterest = interest >= 50,
        isHighInfluence = influence >= 50

    if (isHighInterest && isHighInfluence)
        return StakeholderCategory['Key Stakeholder']
    else if (!isHighInterest && isHighInfluence)
        return StakeholderCategory['Shadow Influencer']
    else if (isHighInterest && !isHighInfluence)
        return StakeholderCategory['Observer']
    else
        return StakeholderCategory['Fellow Traveler']
}
