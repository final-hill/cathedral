import { z } from 'zod'
import { dedent } from '../../utils/dedent.js'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'
import { Example } from './Example.js'
import { FunctionalityOverviewReference } from './EntityReferences.js'

export const Epic = Example.extend({
    reqId: z.string().regex(/^G\.5\.\d+$/, 'Format must be G.5.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('G.5.').default('G.5.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.EPIC),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.EPIC])
        .describe('The UI path template for navigating to this requirement in the web interface'),
    functionality: FunctionalityOverviewReference
        .describe('The functionality that this scenario implements')
}).describe(dedent(`
    An Epic is a High-level usage scenario.
    It represents a main scenario (use case) that the system should cover.
    It should only be a main usage pattern, without details such as special and erroneous cases.
`))

export type EpicType = z.infer<typeof Epic>
