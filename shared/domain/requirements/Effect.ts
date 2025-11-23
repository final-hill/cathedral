import { z } from 'zod'
import { Requirement } from './Requirement.js'
import { dedent } from '../../utils/dedent.js'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const Effect = Requirement.extend({
    reqId: z.string().regex(/^E\.5\.\d+$/, 'Format must be E.5.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('E.5.').prefault('E.5.'),
    reqType: z.enum(ReqType).prefault(ReqType.EFFECT),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.EFFECT])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe(dedent(`
    An Effect is a property of the environment affected by the system; a postcondition or side effect.
    
    Content Guidelines:
    - Name: Should describe the environmental change or impact (e.g., "Temperature Increase", "Database Updated")
    - Description: Should state how the environment will be changed by the system's operation
    - Should describe outcomes external to the system itself
    - Should be observable and verifiable
    - Should use future tense or "will cause" language
    
    Example: "The running system will cause the temperature of the room to increase."
`))

export type EffectType = z.infer<typeof Effect>
