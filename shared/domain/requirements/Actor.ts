import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { Requirement } from './Requirement.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const Actor = Requirement.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.ACTOR),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.ACTOR]),
    // A role is a responsibility that is assigned to an person (Actor)
    isProductOwner: z.boolean().optional()
        .describe('Whether this actor represents the Product Owner for endorsements. This actor can endorse all requirement types.'),
    isImplementationOwner: z.boolean().optional()
        .describe('Whether this actor represents the Implementation Owner for endorsements. This actor can endorse all requirement types.'),
    canEndorseProjectRequirements: z.boolean().optional()
        .describe('Whether this actor can endorse Project requirements'),
    canEndorseEnvironmentRequirements: z.boolean().optional()
        .describe('Whether this actor can endorse Environment requirements'),
    canEndorseGoalsRequirements: z.boolean().optional()
        .describe('Whether this actor can endorse Goals requirements'),
    canEndorseSystemRequirements: z.boolean().optional()
        .describe('Whether this actor can endorse System, Component, Interface, Behavior, and Scenario requirements')
}).describe('A part of a Project, Environment, System, or Goals that may affect or be affected by the associated entities')

export type ActorType = z.infer<typeof Actor>
