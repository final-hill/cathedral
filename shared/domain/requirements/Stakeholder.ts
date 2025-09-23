import { z } from 'zod'
import { Component } from './Component.js'
import { StakeholderCategory } from './StakeholderCategory.js'
import { StakeholderSegmentation } from './StakeholderSegmentation.js'
import { dedent } from '../../utils/dedent.js'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'
import { PersonReference } from './EntityReferences.js'

const computeInterestAndInfluence = (category: StakeholderCategory) => {
    switch (category) {
        case StakeholderCategory['Fellow Traveler']:
            return { interest: 25, influence: 25 }
        case StakeholderCategory['Observer']:
            return { interest: 75, influence: 25 }
        case StakeholderCategory['Shadow Influencer']:
            return { interest: 25, influence: 75 }
        case StakeholderCategory['Key Stakeholder']:
            return { interest: 75, influence: 75 }
        default:
            return { interest: 0, influence: 0 }
    }
}

export const Stakeholder = Component.extend({
    reqId: z.string().regex(/^G\.7\.\d+$/, 'Format must be G.7.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('G.7.').default('G.7.'),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.STAKEHOLDER])
        .describe('The UI path template for navigating to this requirement in the web interface'),
    segmentation: z.nativeEnum(StakeholderSegmentation)
        .describe('The segmentation of the stakeholder'),
    category: z.nativeEnum(StakeholderCategory)
        .describe('The category of the stakeholder'),
    interest: z.number().int().min(0).max(100)
        .describe('The interest that the stakeholder has in the project; AKA "availability". (0 = not interested, 100 = very interested)'),
    influence: z.number().int().min(0).max(100)
        .describe('The influence of the stakeholder on the project; AKA "power". (0 = no influence, 100 = very influential)'),
    persons: z.array(PersonReference).optional()
        .describe('The persons who represent this stakeholder group within the project'),
    reqType: z.nativeEnum(ReqType).default(ReqType.STAKEHOLDER)
}).describe(dedent(`
    A Stakeholder is a human actor who may affect or be affected by a Project or its associated System.
    These are not individuals, but rather groups or roles.
    Example: instead of "Jane Doe", use "Project Manager".
`)).transform(data => ({
    ...data,
    ...computeInterestAndInfluence(data.category)
}))

export type StakeholderType = z.infer<typeof Stakeholder>
