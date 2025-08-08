import { z } from 'zod'
import { Actor } from './Actor.js'
import { ReqType } from './ReqType.js'

export const Component = Actor.extend({
    parentComponent: z.object({
        reqType: z.nativeEnum(ReqType).default(ReqType.COMPONENT),
        id: z.string().uuid()
            .describe('The parent component of the component'),
        name: z.string()
            .describe('The name of the parent component')
    }).optional().describe('The parent component of the component'),
    reqType: z.nativeEnum(ReqType).default(ReqType.COMPONENT)
}).describe('A part of the Project, Environment, Goals, or System')

export type ComponentType = z.infer<typeof Component>
