import { z } from 'zod'
import { Scenario } from './Scenario.js'
import { dedent } from '../../utils/dedent.js'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const UserStory = Scenario.extend({
    reqId: z.string().regex(/^S\.4\.1\.\d+$/, 'Format must be S.4.1.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('S.4.1.').default('S.4.1.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.USER_STORY),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.USER_STORY])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe(dedent(`
    A User Story specifies the handling of a specific user need.

    As a [role], I want [behavior], so that [goal].
    [role] - primary_actor_id (Actor)
    [behavior] - behaviorId (Functional Behavior)
    [goal] - outcomeId
`))

export type UserStoryType = z.infer<typeof UserStory>
