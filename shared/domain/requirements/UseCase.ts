import { z } from 'zod'
import { Scenario } from './Scenario.js'
import { ReqType } from './ReqType.js'

export const UseCase = Scenario.extend({
    reqId: z.string().regex(/^S\.4\.\d+$/, 'Format must be S.4.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('S.4.').default('S.4.'),
    // TODO: <https://github.com/final-hill/cathedral/issues/154>
    scope: z.string().max(100)
        .describe('The scope of the use case'),
    // TODO: <https://github.com/final-hill/cathedral/issues/154>
    level: z.string().max(100)
        .describe('The level of the use case'),
    precondition: z.object({
        reqType: z.nativeEnum(ReqType).default(ReqType.ASSUMPTION),
        id: z.string().uuid()
            .describe('The id of the precondition'),
        name: z.string()
            .describe('The name of the precondition')
    }),
    trigger: z.object({
        // TODO: The trigger is some form of event that starts the use case.
        // But how do we represent this in the system?
        reqType: z.nativeEnum(ReqType),
        id: z.string().uuid()
            .describe('The id of the trigger'),
        name: z.string()
            .describe('The name of the trigger')
    }).describe('The action upon the system that starts the use case.'),
    /*
     * The main success scenario is the most common path through the system.
     * It takes the form of a sequence of steps that describe the interaction:
     * 1. The use case starts when <Actor> <does something>.
     * 2. The system <does something in response>.
     * 3. The <Actor name> does something else.
     * ...
     */
    // mainSuccessScenario: [FunctionalRequirement | Constraint | Role | Responsibility][]
    mainSuccessScenario: z.string().max(100)
        .describe('The main success scenario of the use case'),
    successGuarantee: z.object({
        reqType: z.nativeEnum(ReqType).default(ReqType.EFFECT),
        id: z.string().uuid()
            .describe('The id of the success guarantee'),
        name: z.string()
            .describe('The name of the success guarantee')
    }).describe('An Effect that is guaranteed to be true after the use case is completed.'),
    extensions: z.string().max(100)
        .describe('The extensions of the use case'),
    // TODO: <https://github.com/final-hill/cathedral/issues/154>
    // stakeHoldersAndInterests: z.array(z.string().max(100)).describe('The stakeholders and interests of the use case')
    reqType: z.nativeEnum(ReqType).default(ReqType.USE_CASE)
}).describe('A Use Case describes a complete interaction between an actor and the system to achieve a goal.')
