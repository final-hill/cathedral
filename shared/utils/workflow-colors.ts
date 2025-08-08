import { WorkflowState } from '#shared/domain/requirements/enums'

export const workflowColorMap = {
    [WorkflowState.Proposed]: 'info',
    [WorkflowState.Rejected]: 'error',
    [WorkflowState.Removed]: 'neutral',
    [WorkflowState.Review]: 'warning',
    [WorkflowState.Active]: 'success',
    [WorkflowState.Parsed]: 'neutral'
} as const

export type WorkflowColor = typeof workflowColorMap[WorkflowState]
