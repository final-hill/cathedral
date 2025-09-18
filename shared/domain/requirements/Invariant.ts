import { z } from 'zod'
import { Requirement } from './Requirement.js'
import { dedent } from '../../utils/dedent.js'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const Invariant = Requirement.extend({
    reqId: z.string().regex(/^E\.6\.\d+$/, 'Format must be E.6.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('E.6.').default('E.6.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.INVARIANT),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.INVARIANT])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe(dedent(`
    An Invariant is an Environment property that must be maintained.
    It constrains the possible states of a System.
    It exists as both an assumption and an effect.
    (precondition and postcondition)
`))

export type InvariantType = z.infer<typeof Invariant>
