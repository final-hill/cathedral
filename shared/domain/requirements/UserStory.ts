import { z } from 'zod'
import { Scenario } from './Scenario.js'
import { dedent } from '../../../shared/utils/dedent.js'
import { ReqType } from './ReqType.js'

export const UserStory = Scenario.extend({
    reqId: z.string().regex(/^S\.4\.1\.\d+$/, 'Format must be S.4.1.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('S.4.1.').default('S.4.1.'),
    functionalBehavior: z.object({
        reqType: z.nativeEnum(ReqType).default(ReqType.FUNCTIONAL_BEHAVIOR),
        id: z.string().uuid()
            .describe('The id of the functional behavior'),
        name: z.string()
            .describe('The name of the functional behavior')
    }).describe('The functional behavior of the User Story'),
    reqType: z.nativeEnum(ReqType).default(ReqType.USER_STORY)
}).describe(dedent(`
    A User Story specifies the handling of a specific user need.

    As a [role], I want [behavior], so that [goal].
    [role] - primary_actor_id (Actor)
    [behavior] - behaviorId (Functional Behavior)
    [goal] - outcomeId
`))

export type UserStoryType = z.infer<typeof UserStory>
