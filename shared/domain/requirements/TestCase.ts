import { dedent } from '../../utils/dedent.js'
import { z } from 'zod'
import { Scenario } from './Scenario.js'
import { ReqType } from './ReqType.js'

export const TestCase = Scenario.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.TEST_CASE)
}).describe(dedent(`
    A TestCase is a specification of the inputs, execution conditions,
    testing procedure, and expected results that define a single test
    to be executed to achieve a particular goal
`))

export type TestCaseType = z.infer<typeof TestCase>
