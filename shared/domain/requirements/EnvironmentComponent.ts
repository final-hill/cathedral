import { z } from 'zod'
import { Component } from './Component.js'
import { dedent } from '../../../shared/utils/dedent.js'
import { ReqType } from './ReqType.js'

export const EnvironmentComponent = Component.extend({
    reqId: z.string().regex(/^E\.2\.\d+$/, 'Format must be E.2.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('E.2.').default('E.2.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.ENVIRONMENT_COMPONENT)
}).describe(dedent(`
    Environment components are the EXTERNAL elements that the system interacts with.
    These external components expose interfaces that the system uses to communicate with.
`))
