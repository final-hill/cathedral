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
    An Epic is a high-level usage scenario representing a main pattern the system should cover.
    
    Content Guidelines:
    - Name: Should describe a broad user goal or journey (e.g., "Online Shopping Experience", "User Onboarding")
    - Description: Should explain the high-level scenario, actors involved, and overall outcome
    - Should focus on the main, happy-path usage pattern
    - Should NOT include detailed steps, special cases, or error handling (those belong in Use Cases)
    - Should be decomposable into smaller User Stories or Use Cases
    - Should provide context for understanding multiple related requirements
`))

export type EpicType = z.infer<typeof Epic>
