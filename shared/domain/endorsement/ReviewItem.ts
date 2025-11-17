import { z } from 'zod'
import { ReviewStatus } from './ReviewStatus.js'
import { ReviewCategory } from './ReviewCategory.js'

/**
 * Base review item schema for all review types
 */
export const ReviewItem = z.object({
    id: z.string()
        .describe('Unique identifier for the review item'),
    category: z.nativeEnum(ReviewCategory)
        .describe('Category that this review item belongs to'),
    title: z.string()
        .describe('Human-readable title for the review item'),
    description: z.string().optional()
        .describe('Optional detailed description of what is being reviewed'),
    status: z.nativeEnum(ReviewStatus)
        .describe('Current status of this review item'),
    isRequired: z.boolean()
        .describe('Whether this review item must be completed before approval'),
    canUserReview: z.boolean()
        .describe('Whether the current user can perform this review'),
    checkDetails: z.record(z.unknown()).nullable().optional()
        .describe('Additional details specific to the check type (for automated checks)')
}).describe('Represents a single review item within a requirement review process')

export type ReviewItemType = z.infer<typeof ReviewItem>
