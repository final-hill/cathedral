import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { MetaRequirement } from './MetaRequirement.js'
import { WorkflowState } from './WorkflowState.js'
import { RequirementReference } from './EntityReferences.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const ParsedRequirements = MetaRequirement.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.PARSED_REQUIREMENTS),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.PARSED_REQUIREMENTS])
        .describe('The UI path template for navigating to this requirement in the web interface'),
    reqId: z.string().regex(/^P\.7\.\d+$/, 'Format must be P.7.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('P.7.').default('P.7.'),
    workflowState: z.nativeEnum(WorkflowState).default(WorkflowState.Parsed),
    requirements: z.array(RequirementReference).default([])
}).describe('A collection of requirements that have been parsed from a string (statement). ParsedRequirements are always in the Parsed state.')

export type ParsedRequirementsType = z.infer<typeof ParsedRequirements>
