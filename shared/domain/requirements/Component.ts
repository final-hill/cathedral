import { z } from 'zod'
import { Actor } from './Actor.js'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'
import { ComponentReference } from './EntityReferences.js'

export const Component = Actor.extend({
    parentComponent: ComponentReference
        .optional().describe('The parent component of the component'),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.COMPONENT])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe('A part of the Project, Environment, Goals, or System')

export type ComponentType = z.infer<typeof Component>
