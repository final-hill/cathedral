import { z } from 'zod'
import { Goal } from './Goal.js'
import { ReqType } from './ReqType.js'
import { dedent } from '../../utils/dedent.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const ContextAndObjective = Goal.extend({
    name: z.literal('Context And Objective')
        .describe('The name'),
    reqId: z.string().regex(/^G\.1\.\d+$/, 'Format must be G.1.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('G.1.').default('G.1.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.CONTEXT_AND_OBJECTIVE),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.CONTEXT_AND_OBJECTIVE])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe(dedent(`
    High-level view of the project: organizational context and reason for building the system
`))

export type ContextAndObjectiveType = z.infer<typeof ContextAndObjective>
