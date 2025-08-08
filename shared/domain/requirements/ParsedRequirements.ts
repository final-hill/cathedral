import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { MetaRequirement } from './MetaRequirement.js'
import { WorkflowState } from './WorkflowState.js'

export const ParsedRequirements = MetaRequirement.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.PARSED_REQUIREMENTS),
    reqId: z.string().regex(/^P\.7\.\d+$/, 'Format must be P.7.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('P.7.').default('P.7.'),
    workflowState: z.nativeEnum(WorkflowState).default(WorkflowState.Parsed),
    requirements: z.array(z.object({
        reqType: z.nativeEnum(ReqType),
        id: z.string().uuid()
            .describe('The id of the requirement'),
        name: z.string()
            .describe('The name of the requirement'),
        workflowState: z.nativeEnum(WorkflowState)
            .describe('The workflow state of the requirement'),
        lastModified: z.date()
            .describe('The last modified date of the requirement'),
        reqIdPrefix: z.string().optional()
            .describe('The requirement ID prefix for this requirement type')
    })).default([])
}).describe('A collection of requirements that have been parsed from a string (statement). ParsedRequirements are always in the Parsed state.')

export type ParsedRequirementsType = z.infer<typeof ParsedRequirements>
