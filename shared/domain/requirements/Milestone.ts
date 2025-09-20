import { Requirement } from './Requirement.js'
import { ReqType } from './ReqType.js'
import { z } from 'zod'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const Milestone = Requirement.extend({
    reqId: z.string().regex(/^P\.3\.\d+$/, 'Format must be P.3.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('P.3.').default('P.3.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.MILESTONE),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.MILESTONE])
        .describe('The UI path template for navigating to this requirement in the web interface'),
    dueDate: z.date().optional()
        .describe('The expected completion date for this milestone')
}).describe('A significant point or event in the project timeline')

export type MilestoneType = z.infer<typeof Milestone>
