import { z } from 'zod'
import { Actor } from './Actor.js'
import { ReqType } from './ReqType.js'

const _Component = Actor.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.COMPONENT)
})

export const Component = _Component.extend({
    parentComponent: _Component.pick({ reqType: true, id: true, name: true })
        .optional().describe('The parent component of the component')
}).describe('A part of the Project, Environment, Goals, or System')

export type ComponentType = z.infer<typeof Component>
