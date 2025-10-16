import { ReqType } from './ReqType'

/**
 * Singleton requirement types that can only have one Active version at a time.
 * Unlike other requirements that can have multiple concurrent Active instances,
 * these requirement types enforce a single Active requirement constraint.
 *
 * For example, Context and Objective provides the single high-level view of the project's
 * organizational context and reason for building the system. Having multiple active versions
 * would create ambiguity about the project's purpose and scope.
 */
export const SINGLETON_REQUIREMENT_TYPES: readonly ReqType[] = [
    ReqType.CONTEXT_AND_OBJECTIVE
] as const
