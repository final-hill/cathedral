import { ReqType } from './ReqType'

/**
 * Minimum requirement types based on the Minimum Requirements Outcome Principle.
 * These requirement types must have at least one active requirement for a complete solution.
 */
export const MINIMUM_REQUIREMENT_TYPES: readonly ReqType[] = [
    ReqType.CONTEXT_AND_OBJECTIVE,
    ReqType.OUTCOME,
    ReqType.STAKEHOLDER,
    ReqType.SYSTEM_COMPONENT,
    ReqType.FUNCTIONAL_BEHAVIOR,
    ReqType.CONSTRAINT,
    ReqType.MILESTONE,
    ReqType.TASK
] as const
