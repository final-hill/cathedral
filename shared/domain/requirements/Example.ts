import { z } from 'zod'
import { Behavior } from './Behavior.js'
import { ReqType } from './ReqType.js'
import { FunctionalityReference, OutcomeReference, StakeholderReference } from './EntityReferences.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

// aka 'Scenario'
export const Example = Behavior.extend({
    primaryActor: StakeholderReference
        .describe('Primary actor involved in the scenario'),
    outcome: OutcomeReference
        .describe('The outcome (goal) that the scenario is aiming to achieve'),
    functionality: FunctionalityReference
        // G.4 | S.2
        .describe('The functionality that this scenario implements'),
    reqType: z.nativeEnum(ReqType).default(ReqType.EXAMPLE),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.EXAMPLE])
}).describe('Illustration of behavior through a usage scenario; describing paths of interaction between actors and the system.')

export type ExampleType = z.infer<typeof Example>
