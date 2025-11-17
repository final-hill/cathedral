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
    // Role capabilities for endorsement system
    isProductOwner: z.boolean().optional()
        .describe('Whether this person represents the Product Owner for endorsements. This person can endorse all requirement types.'),
    isImplementationOwner: z.boolean().optional()
        .describe('Whether this person represents the Implementation Owner for endorsements. This person can endorse all requirement types.'),
    canEndorseProjectRequirements: z.boolean().optional()
        .describe('Whether this person can endorse Project requirements'),
    canEndorseEnvironmentRequirements: z.boolean().optional()
        .describe('Whether this person can endorse Environment requirements'),
    canEndorseGoalsRequirements: z.boolean().optional()
        .describe('Whether this person can endorse Goals requirements'),
    canEndorseSystemRequirements: z.boolean().optional()
        .describe('Whether this person can endorse System, Component, Interface, Behavior, and Scenario requirements'),
    reqId: z.string().regex(/^P\.1\.\d+$/, 'Format must be P.1.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('P.1.').default('P.1.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.PERSON),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.PERSON])
}).describe(dedent(`
    A Person represents a member of the project staff with associated contact information, roles, and responsibilities.

    Content should:
    - Name: Be a person's name or role title
    - Description: Describe the person's role, responsibilities, or project relevance
    - Focus: On human actors, their expertise, and their contribution to the project
    - Avoid: System components, technical requirements, or non-human entities

    Examples: "John Smith, Lead Developer", "Sarah Johnson, Product Owner responsible for feature prioritization"
`))

export type PersonType = z.infer<typeof Person>
