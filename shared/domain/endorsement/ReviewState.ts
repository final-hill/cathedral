import { z } from 'zod'
import { ReviewStatus } from './ReviewStatus.js'
import { ReviewItem } from './ReviewItem.js'

export const ReviewState = z.object({
    overall: z.nativeEnum(ReviewStatus)
        .describe('Overall status computed from all review items'),
    items: z.array(ReviewItem)
        .describe('Individual review items that make up this review')
}).describe('Represents the complete review state of a requirement including all review items and computed status')

export type ReviewStateType = z.infer<typeof ReviewState>
