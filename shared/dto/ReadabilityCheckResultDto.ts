import { z } from 'zod'
import { ReadabilityCheckType, ReadabilityCheckDetails } from '../domain/endorsement/ReadabilityCheck.js'
import { EndorsementStatus } from '../domain/endorsement/EndorsementStatus.js'

export const ReadabilityCheckResultDto = z.object({
    checkType: z.enum(ReadabilityCheckType)
        .describe('Type of readability check performed'),
    status: z.enum(EndorsementStatus)
        .describe('Result status of the check (APPROVED, REJECTED, PENDING)'),
    title: z.string()
        .describe('Human-readable title for the check'),
    description: z.string()
        .describe('Summary description of the check result'),
    details: ReadabilityCheckDetails
        .describe('Detailed check-specific data')
}).describe('Result of a single automated readability check')

export type ReadabilityCheckResultDtoType = z.infer<typeof ReadabilityCheckResultDto>
