import { z } from 'zod'
import { AuditMetadata } from '../AuditMetadata.js'
import { ReqType } from './ReqType.js'
import { reqIdPattern } from './reqIdPattern.js'
import { WorkflowState } from './WorkflowState.js'

export type ReqIdPrefix = `${'P' | 'E' | 'G' | 'S' | '0'}.${number}.`
export type ReqId = `${ReqIdPrefix}${number}`

export const Requirement = AuditMetadata.extend({
    id: z.string().uuid().readonly()
        .describe('The unique identifier'),
    reqId: z.string().regex(reqIdPattern, 'Format must be [P|E|G|S|0].[number].[number]').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.string().regex(/^[PEGS0]\.([0-9]+\.)+$/, 'Format must be [P|E|G|S|0].[number]...').optional()
        .describe('The prefix of the requirement ID'),
    name: z.string().max(100).nonempty()
        .describe('The name'),
    description: z.string().max(1000)
        .describe('A human-readable explanation of the Requirement'),
    // see: https://github.com/final-hill/cathedral/issues/368
    // property: z.string().max(100).describe('A property is a Predicate formalizing its associated statement'),
    reqType: z.nativeEnum(ReqType).default(ReqType.REQUIREMENT),
    workflowState: z.nativeEnum(WorkflowState)
        .describe('The current state of the Requirement'),
    parsedRequirements: z.object({
        reqType: z.nativeEnum(ReqType).default(ReqType.PARSED_REQUIREMENTS),
        id: z.string().uuid()
            .describe('The id of the parsed requirement'),
        name: z.string()
            .describe('The name of the parsed requirement')
    }).optional()
        .describe('The ParsedRequirements container that this requirement is derived from'),
    solution: z.object({
        reqType: z.nativeEnum(ReqType).default(ReqType.SOLUTION),
        id: z.string().uuid()
            .describe('The id of the solution'),
        name: z.string()
            .describe('The name of the solution')
    }).optional().describe('The solution that the requirement belongs to')
}).describe('A Requirement is a statement that specifies a property.')

export type RequirementType = z.infer<typeof Requirement>
