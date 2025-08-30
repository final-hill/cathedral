import { z } from 'zod'
import { Requirement } from './Requirement.js'
import { ReqType } from './ReqType.js'
import { WorkflowState } from './WorkflowState.js'
import { dedent } from '../../utils/dedent.js'

export const Silence = Requirement.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.SILENCE),
    workflowState: z.nativeEnum(WorkflowState).default(WorkflowState.Rejected)
}).describe(dedent(`
    A Silence requirement represents content that could not be parsed into a proper requirement.
    These are automatically created in the Rejected state and have limited workflow transitions:
    - Cannot be approved or put in review
    - Cannot be revised (only removed)
    - Once removed, cannot be restored

    The description contains the offending text that could not be parsed.
`))

export type SilenceType = z.infer<typeof Silence>
