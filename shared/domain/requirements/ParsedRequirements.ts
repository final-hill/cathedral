import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { MetaRequirement } from './MetaRequirement.js'
import { WorkflowState } from './WorkflowState.js'

export const ParsedRequirements = MetaRequirement.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.PARSED_REQUIREMENTS),
    workflowState: z.nativeEnum(WorkflowState).default(WorkflowState.Parsed),
    requirements: z.array(z.object({
        reqType: z.nativeEnum(ReqType),
        id: z.string().uuid()
            .describe('The id of the requirement'),
        name: z.string()
            .describe('The name of the requirement')
    })).default([])
}).describe('A collection of requirements that have been parsed from a string (statement). ParsedRequirements are always in the Parsed state.')
