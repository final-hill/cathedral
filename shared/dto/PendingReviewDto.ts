import { z } from 'zod'
import { Endorsement } from '../domain/endorsement/Endorsement.js'
import { RequirementReference } from '../domain/requirements/EntityReferences.js'

export const PendingReviewDto = z.object({
    endorsement: Endorsement,
    requirement: RequirementReference
}).describe('A pending review item with endorsement and requirement context')

export type PendingReviewDtoType = z.infer<typeof PendingReviewDto>

export const PendingReviewsDto = z.array(PendingReviewDto)
    .describe('Array of pending review items')

export type PendingReviewsDtoType = z.infer<typeof PendingReviewsDto>
