import type { RequirementType } from '#shared/domain/requirements'
import type { WorkflowAction } from '~/types'
import { WorkflowState } from '#shared/domain/requirements/enums'
import { SINGLETON_REQUIREMENT_TYPES } from '#shared/domain/requirements/singletonRequirements'

export interface WorkflowActionItem<_TCallback extends string = 'onClick'> {
    label: string
    icon: string
    color: 'success' | 'error' | 'info' | 'neutral' | 'warning' | 'primary' | 'secondary'
    [key: string]: unknown
}

export interface GetWorkflowActionsOptions<TCallback extends string = 'onClick'> {
    /**
     * The requirement to generate actions for
     */
    requirement: RequirementType
    /**
     * Base path for navigation (e.g., /o/[org]/s/[solution]/use-cases)
     */
    basePath: string
    /**
     * Callback function to perform workflow actions
     */
    performWorkflowAction: (params: { requirement: RequirementType, action: WorkflowAction }) => void | Promise<void>
    /**
     * Callback function to confirm and perform workflow actions
     */
    confirmAndPerformAction: (params: { requirement: RequirementType, action: WorkflowAction, confirmMessage: string }) => void | Promise<void>
    /**
     * Callback function to navigate to a path
     */
    navigate: (path: string) => unknown
    /**
     * Name of the callback property (e.g., 'onClick', 'onSelect')
     * @default 'onClick'
     */
    callbackPropertyName?: TCallback
    /**
     * Whether to include a "View" action
     * @default false
     */
    includeViewAction?: boolean
}

/**
 * Generates workflow action items for a requirement based on its current workflow state
 * This is a shared utility used by both RequirementView and RequirementList
 */
export function getWorkflowActions<TCallback extends string = 'onClick'>({
    requirement,
    basePath,
    performWorkflowAction,
    confirmAndPerformAction,
    navigate,
    callbackPropertyName = 'onClick' as TCallback,
    includeViewAction = false
}: GetWorkflowActionsOptions<TCallback>): Array<WorkflowActionItem<TCallback> & Record<TCallback, () => unknown>> {
    const actions: Array<WorkflowActionItem<TCallback> & Record<TCallback, () => unknown>> = []

    // View action - optional (used by RequirementList)
    if (includeViewAction) {
        actions.push({
            label: 'View',
            icon: 'i-lucide-eye',
            color: 'info',
            [callbackPropertyName]: () => navigate(`${basePath}/${requirement.id}`)
        } as WorkflowActionItem<TCallback> & Record<TCallback, () => unknown>)
    }

    // Edit action - only for Proposed state
    if (requirement.workflowState === WorkflowState.Proposed) {
        actions.push({
            label: 'Edit',
            icon: 'i-lucide-pen',
            color: 'primary',
            [callbackPropertyName]: () => navigate(`${basePath}/${requirement.id}/edit`)
        } as WorkflowActionItem<TCallback> & Record<TCallback, () => unknown>)
    }

    // State transition actions
    switch (requirement.workflowState) {
        case WorkflowState.Proposed:
            actions.push(
                {
                    label: 'Submit for Review',
                    icon: 'i-lucide-check-circle',
                    color: 'warning',
                    [callbackPropertyName]: () => performWorkflowAction({ requirement, action: 'review' })
                } as WorkflowActionItem<TCallback> & Record<TCallback, () => unknown>,
                {
                    label: 'Remove',
                    icon: 'i-lucide-trash-2',
                    color: 'error',
                    [callbackPropertyName]: () => confirmAndPerformAction({
                        requirement,
                        action: 'remove',
                        confirmMessage: `Are you sure you want to remove requirement "${requirement.name}"?`
                    })
                } as WorkflowActionItem<TCallback> & Record<TCallback, () => unknown>
            )
            break
        case WorkflowState.Review:
            actions.push({
                label: 'Review',
                icon: 'i-lucide-clipboard-check',
                color: 'warning',
                [callbackPropertyName]: () => navigate(`${basePath}/${requirement.id}/review`)
            } as WorkflowActionItem<TCallback> & Record<TCallback, () => unknown>)
            break
        case WorkflowState.Active:
            actions.push({
                label: 'Revise',
                icon: 'i-lucide-pen',
                color: 'info',
                [callbackPropertyName]: () => performWorkflowAction({ requirement, action: 'revise' })
            } as WorkflowActionItem<TCallback> & Record<TCallback, () => unknown>)

            // Singleton requirements cannot be removed when Active (they are essential)
            if (!SINGLETON_REQUIREMENT_TYPES.includes(requirement.reqType)) {
                actions.push({
                    label: 'Remove',
                    icon: 'i-lucide-trash-2',
                    color: 'error',
                    [callbackPropertyName]: () => confirmAndPerformAction({
                        requirement,
                        action: 'remove',
                        confirmMessage: `Are you sure you want to remove requirement "${requirement.name}"?`
                    })
                } as WorkflowActionItem<TCallback> & Record<TCallback, () => unknown>)
            }
            break
        case WorkflowState.Rejected:
            actions.push(
                {
                    label: 'Revise',
                    icon: 'i-lucide-edit',
                    color: 'info',
                    [callbackPropertyName]: () => performWorkflowAction({ requirement, action: 'revise' })
                } as WorkflowActionItem<TCallback> & Record<TCallback, () => unknown>,
                {
                    label: 'Remove',
                    icon: 'i-lucide-trash-2',
                    color: 'error',
                    [callbackPropertyName]: () => confirmAndPerformAction({
                        requirement,
                        action: 'remove',
                        confirmMessage: `Are you sure you want to remove requirement "${requirement.name}"?`
                    })
                } as WorkflowActionItem<TCallback> & Record<TCallback, () => unknown>
            )
            break
        case WorkflowState.Removed:
            actions.push({
                label: 'Restore',
                icon: 'i-lucide-refresh-cw',
                color: 'neutral',
                [callbackPropertyName]: () => performWorkflowAction({ requirement, action: 'restore' })
            } as WorkflowActionItem<TCallback> & Record<TCallback, () => unknown>)
            break
    }

    return actions
}
