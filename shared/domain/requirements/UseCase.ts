import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { SystemComponent } from './SystemComponent.js'
import { AssumptionReference, EffectReference, ScenarioStepReference, StakeholderReference, InterfaceOperationReference, FunctionalBehaviorReference } from './EntityReferences.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'
import { Example } from './Example.js'
import { Prioritizable } from './Prioritizable.js'
import { dedent } from '../../utils/dedent.js'

export const UseCase = Example.extend({
    ...Prioritizable.shape,
    reqId: z.string().regex(/^S\.4\.2\.\d+$/, 'Format must be S.4.2.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('S.4.2.').default('S.4.2.'),
    // 'Context of use' is the inherited 'outcome' field
    scope: SystemComponent.pick({ reqType: true, id: true, name: true })
        .describe('The SystemComponent that defines the boundary of this use case'),
    // 'level' is subsumed by the inherited 'outcome' field
    preconditions: z.array(AssumptionReference).default([])
        .describe('State the system must be in before the use case starts'),
    trigger: InterfaceOperationReference
        .describe('The interface operation that starts this use case.'),
    functionality: FunctionalBehaviorReference
        .describe('The functional behavior that this use case addresses.'),
    mainSuccessScenario: z.array(
        ScenarioStepReference
    ).default([]).describe('Structured sequence of action steps in the main success scenario'),
    successGuarantees: z.array(EffectReference).default([])
        .describe('Effects that are guaranteed to be true after the use case is completed successfully.'),
    extensions: z.array(
        ScenarioStepReference
    ).default([]).describe('Alternative and exception flows with both conditions and actions'),
    stakeholders: z.array(StakeholderReference).default([])
        .describe('The stakeholders in the use case'),
    reqType: z.nativeEnum(ReqType).default(ReqType.USE_CASE),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.USE_CASE])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe(dedent(`
    A Use Case describes a complete interaction between an actor and the system to achieve a goal.
    
    Content Guidelines:
    - Name: Should describe the user's goal or action using verb-noun format (e.g., "Process Payment", "Submit Order")
    - Description: Should explain the purpose, context, and value of the use case
    - Should focus on WHAT the user wants to accomplish, not HOW the system implements it
    - Should reference actors, preconditions, success guarantees, and scenario steps
    - Should be written from the user's perspective
`))

export type UseCaseType = z.infer<typeof UseCase>
