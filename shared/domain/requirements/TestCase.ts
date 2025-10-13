import { dedent } from '../../utils/dedent.js'
import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { Example } from './Example.js'
import { FunctionalBehaviorReference } from './EntityReferences.js'

export const TestCase = Example.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.TEST_CASE),
    functionality: FunctionalBehaviorReference
        .describe('The functional behavior that this user story addresses')
}).describe(dedent(`
    A TestCase is a specification of the inputs, execution conditions,
    testing procedure, and expected results that define a single test
    to be executed to achieve a particular goal
`))

export type TestCaseType = z.infer<typeof TestCase>
