import { dedent } from '../../../shared/utils/dedent.js'
import { Component } from './Component.js'
import { z } from 'zod'
import { ReqType } from './ReqType.js'

export const _SystemComponent = Component.extend({
    reqId: z.string().regex(/^S\.1\.\d+$/, 'Format must be S.1.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('S.1.').default('S.1.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.SYSTEM_COMPONENT)
})

export const SystemComponent = _SystemComponent.extend({
    parentComponent: _SystemComponent.pick({ reqType: true, id: true, name: true })
        .describe('The parent component of the component').optional()
}).describe(dedent(`
    A System Component is a self-contained part of a system.
    These are often hierarchical and can be used to describe the structure of a System.
`))

export type SystemComponentType = z.infer<typeof SystemComponent>
