import { z } from 'zod'

/**
 * Base schema for automated check details
 * All category-specific check details (ReadabilityCheckDetails, CorrectnessCheckDetails, etc.)
 * should extend this base schema
 */
export const AutomatedCheckDetails = z.object({
    checkType: z.string()
        .describe('Type of automated check performed (category-specific)'),
    title: z.string().optional()
        .describe('Human-readable title for the check'),
    description: z.string().optional()
        .describe('Summary description of the check result'),
    errorMessage: z.string().optional()
        .describe('Error message if check failed to execute'),
    retryCount: z.number().optional()
        .describe('Number of times this check has been retried')
}).describe('Base schema for automated check details')

export type AutomatedCheckDetailsType = z.infer<typeof AutomatedCheckDetails>
