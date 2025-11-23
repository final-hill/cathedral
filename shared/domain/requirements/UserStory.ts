import { z } from 'zod'
import { dedent } from '../../utils/dedent.js'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'
import { Example } from './Example.js'
import { Prioritizable } from './Prioritizable.js'
import { FunctionalBehaviorReference } from './EntityReferences.js'

export const UserStory = Example.extend({
    ...Prioritizable.shape,
    reqId: z.string().regex(/^S\.4\.1\.\d+$/, 'Format must be S.4.1.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('S.4.1.').prefault('S.4.1.'),
    reqType: z.enum(ReqType).prefault(ReqType.USER_STORY),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.USER_STORY])
        .describe('The UI path template for navigating to this requirement in the web interface'),
    functionality: FunctionalBehaviorReference
        .describe('The functional behavior that this user story addresses')
}).describe(dedent(`
    A User Story specifies the handling of a specific user need.

    Pattern: As a [role], I want [behavior], so that [goal].
    [role] - primaryActor (Actor)
    [behavior] - functionality (Functional Behavior)
    [goal] - outcome (Goal)
    
    Content Guidelines:
    - Name: Should be concise and goal-oriented (e.g., "User Registration", "View Order History")
    - Description: Should follow the "As a [user role], I want [capability], so that [benefit]" pattern
    - Should focus on user perspective and value delivered
    - Should be independent, negotiable, and testable
    - Should fit within a single iteration/sprint
    - Should NOT include implementation details or technical specifications
`))

export type UserStoryType = z.infer<typeof UserStory>
