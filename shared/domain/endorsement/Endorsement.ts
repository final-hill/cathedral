import { z } from 'zod'
import { RequirementVersionReference, ActorReference } from '../requirements/EntityReferences.js'
import { EndorsementStatus } from './EndorsementStatus.js'
import { EndorsementCategory } from './EndorsementCategory.js'

export const Endorsement = z.object({
    id: z.string().uuid()
        .describe('The unique identifier'),
    requirementVersion: RequirementVersionReference
        .describe('Reference to the specific version of the requirement being endorsed'),
    endorsedBy: ActorReference.optional()
        .describe('Reference to the actor providing the endorsement (null/undefined for automated checks)'),
    category: z.nativeEnum(EndorsementCategory)
        .describe('The category of endorsement (role-based or specific quality dimension)'),
    status: z.nativeEnum(EndorsementStatus)
        .describe('Current status of the endorsement'),
    endorsedAt: z.coerce.date().optional()
        .describe('When the endorsement was approved'),
    rejectedAt: z.coerce.date().optional()
        .describe('When the endorsement was rejected'),
    comments: z.string().nullable().optional()
        .describe('Optional comments from the endorser'),
    checkDetails: z.record(z.unknown()).nullable().optional()
        .describe('Details of the automated check (null for manual endorsements)')
}).describe('Represents an endorsement of a specific requirement version by an actor for a specific quality dimension')

export type EndorsementType = z.infer<typeof Endorsement>
