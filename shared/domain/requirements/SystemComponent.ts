import { dedent } from '../../utils/dedent.js'
import { Component } from './Component.js'
import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const BaseSystemComponent = Component.extend({
    reqId: z.string().regex(/^S\.1\.\d+$/, 'Format must be S.1.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('S.1.').default('S.1.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.SYSTEM_COMPONENT),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.SYSTEM_COMPONENT])
        .describe('The UI path template for navigating to this requirement in the web interface')
})

export const SystemComponent = BaseSystemComponent.extend({
    parentComponent: BaseSystemComponent.pick({ reqType: true, id: true, name: true })
        .describe('The parent component of the component').optional()
}).describe(dedent(`
    A System Component is a self-contained part of a system.
    These are often hierarchical and can be used to describe the structure of a System.
`))

export type SystemComponentType = z.infer<typeof SystemComponent>
