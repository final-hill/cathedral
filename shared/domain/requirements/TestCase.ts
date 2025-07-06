import { dedent } from '../../../shared/utils/dedent.js'
import { z } from 'zod'
import { Example } from './Example.js'
import { ReqType } from './ReqType.js'

export const TestCase = Example.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.TEST_CASE)
}).describe(dedent(`
    A TestCase is a specification of the inputs, execution conditions,
    testing procedure, and expected results that define a single test
    to be executed to achieve a particular goal
`))
