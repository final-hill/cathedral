import { z } from 'zod'
import { Actor } from './Actor.js'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

const _Component = Actor.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.COMPONENT)
})

export const Component = _Component.extend({
    parentComponent: _Component.pick({ reqType: true, id: true, name: true })
        .optional().describe('The parent component of the component'),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.COMPONENT])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe('A part of the Project, Environment, Goals, or System')

export type ComponentType = z.infer<typeof Component>
