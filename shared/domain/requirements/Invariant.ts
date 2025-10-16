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
    An Invariant is an Environment property that must always be true and maintained.
    It constrains the possible states of a System by defining rules that cannot be violated.
    It exists as both an assumption and an effect (precondition and postcondition).
    
    Examples:
    - A list cannot have a negative number of items
    - The gravitational constant remains 9.8 m/s² on Earth
    - A bank account balance cannot exceed the account limit
    - A user must be logged in to access protected resources
    - Temperature cannot go below absolute zero (-273.15°C)
`))

export type InvariantType = z.infer<typeof Invariant>
