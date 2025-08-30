import { z } from 'zod'
import { Goal } from './Goal.js'
import { dedent } from '../../utils/dedent.js'
import { ReqType } from './ReqType.js'
import { FunctionalBehavior } from './FunctionalBehavior.js'

export const Epic = Goal.extend({
    reqId: z.string().regex(/^G\.5\.\d+$/, 'Format must be G.5.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('G.5.').default('G.5.'),
    functionalBehavior: FunctionalBehavior.pick({ reqType: true, id: true, name: true })
        .describe('The functional behavior of the Epic'),
    reqType: z.nativeEnum(ReqType).default(ReqType.EPIC)
}).describe(dedent(`
    An Epic is a collection of Use Cases and User Stories all directed towards a common goal;
    Ex: "decrease the percentage of of fraudulent sellers by 20%"'
`))

export type EpicType = z.infer<typeof Epic>
