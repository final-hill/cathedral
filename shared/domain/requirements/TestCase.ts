import { dedent } from '../../utils/dedent.js'
import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { Example } from './Example.js'
import { FunctionalBehaviorReference } from './EntityReferences.js'

export const TestCase = Example.extend({
    reqType: z.enum(ReqType).prefault(ReqType.TEST_CASE),
    functionality: FunctionalBehaviorReference
        .describe('The functional behavior that this user story addresses')
}).describe(dedent(`
    A TestCase is a specification of inputs, execution conditions, testing procedure, and expected results for a single test.
    
    Content Guidelines:
    - Name: Should describe what is being tested (e.g., "Valid Login", "Invalid Email Format")
    - Description: Should specify test inputs, preconditions, steps to execute, and expected outcomes
    - Should be specific and executable
    - Should verify a particular behavior, requirement, or scenario
    - Should include both positive and negative test scenarios
    - Should be independent and repeatable
`))

export type TestCaseType = z.infer<typeof TestCase>
