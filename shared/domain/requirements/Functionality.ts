import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { dedent } from '../../utils/dedent.js'
import { Behavior } from './Behavior.js'

export const Functionality = Behavior.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.FUNCTIONALITY)
}).describe(dedent(`
    Functionality describes Functional (what) and Non-Functional (how) Behaviors of a system.
`))

export type FunctionalityType = z.infer<typeof Functionality>
