import { Requirement } from './Requirement.js'
import { ReqType } from './ReqType.js'
import { z } from 'zod'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'
import { PersonReference } from './EntityReferences.js'
import { dedent } from '../../utils/dedent.js'

export const Task = Requirement.extend({
    reqId: z.string().regex(/^P\.4\.\d+$/, 'Format must be P.4.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('P.4.').default('P.4.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.TASK),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.TASK])
        .describe('The UI path template for navigating to this requirement in the web interface'),
    estimatedHours: z.number().min(0).optional()
        .describe('Estimated hours to complete this task'),
    assignedTo: PersonReference.optional()
        .describe('Person or team assigned to this task'),
    dueDate: z.date().optional()
        .describe('Expected completion date for this task')
}).describe(dedent(`
    A Task is a specific activity or work item that needs to be completed as part of the project.
    
    Content Guidelines:
    - Name: Should describe the work to be done using action verbs (e.g., "Implement Login API", "Review Documentation")
    - Description: Should explain the task scope, deliverables, and any relevant context
    - Should be specific, actionable, and estimable
    - Should be completable by one person or team
    - Should have clear completion criteria (definition of done)
`))

export type TaskType = z.infer<typeof Task>
