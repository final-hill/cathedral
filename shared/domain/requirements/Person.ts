import { z } from 'zod'
import { Actor } from './Actor.js'
import { dedent } from '../../utils/dedent.js'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'
import { StakeholderReference } from './EntityReferences.js'
import { AppUserReference } from '../application/EntityReferences.js'

export const Person = Actor.extend({
    name: z.string().max(100)
        .describe('The name of the person'), // Override to allow empty string
    appUser: AppUserReference
        .describe('The application user this person is linked to for authentication and authorization'),
    stakeholders: z.array(StakeholderReference)
        .describe('The stakeholder groups this person represents within the project'),
    reqId: z.string().regex(/^P\\.1\\.\\d+$/, 'Format must be P.1.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('P.1.').default('P.1.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.PERSON),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.PERSON])
}).describe(dedent(`
    A member of the Project staff with associated contact information, roles, and responsibilities.
`))

export type PersonType = z.infer<typeof Person>
