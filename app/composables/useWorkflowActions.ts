import type { RequirementType } from '#shared/domain/requirements'
import type { WorkflowAction } from '~/types'
import { WorkflowState } from '#shared/domain/requirements/enums'

export interface UseWorkflowActionsOptions {
    /**
     * Organization slug from route params
     */
    organizationSlug: Ref<string>
    /**
     * Solution slug from route params
     */
    solutionSlug: Ref<string>
    /**
     * Base path for the requirement type (e.g., /o/[org]/s/[solution]/use-cases)
     */
    basePath: Ref<string>
    /**
     * Optional callback to execute after successful workflow action
     * Used by RequirementList to emit refresh event
     */
    onSuccess?: (options: { action: WorkflowAction, requirement: RequirementType }) => void | Promise<void>
}

/**
 * Composable for handling requirement workflow actions (review, revise, remove, restore)
 * Provides shared logic for executing workflow transitions and handling errors
 */
export function useWorkflowActions(options: UseWorkflowActionsOptions) {
    const { organizationSlug, solutionSlug, basePath, onSuccess } = options,
        toast = useToast(),
        /**
         * Performs a workflow action on a requirement
         * Handles API calls, navigation, and error handling
         */
        performWorkflowAction = async ({
            requirement,
            action
        }: {
            requirement: RequirementType
            action: WorkflowAction
        }) => {
            try {
                let endpoint: string

                switch (action) {
                    case 'review':
                        endpoint = `/api/requirements/${requirement.reqType}/proposed/${requirement.id}/review`
                        break
                    case 'revise':
                        if (requirement.workflowState === WorkflowState.Rejected)
                            endpoint = `/api/requirements/${requirement.reqType}/rejected/${requirement.id}/revise`
                        else if (requirement.workflowState === WorkflowState.Active)
                            endpoint = `/api/requirements/${requirement.reqType}/active/${requirement.id}/edit`
                        else
                            throw new Error(`Invalid revise action for requirement in ${requirement.workflowState} state`)

                        break
                    case 'remove':
                        endpoint = `/api/requirements/${requirement.reqType}/${requirement.workflowState.toLowerCase()}/${requirement.id}/remove`
                        break
                    case 'restore':
                        endpoint = `/api/requirements/${requirement.reqType}/removed/${requirement.id}/restore`
                        break
                    default:
                        throw new Error(`Unknown workflow action: ${action}`)
                }

                await $fetch(endpoint, {
                    method: 'POST',
                    body: {
                        solutionSlug: solutionSlug.value,
                        organizationSlug: organizationSlug.value
                    }
                })

                toast.add({
                    icon: 'i-lucide-check',
                    title: 'Success',
                    description: `Requirement ${action}d successfully`
                })

                // Call custom success handler if provided (for RequirementList refresh)
                if (onSuccess)
                    await onSuccess({ action, requirement })
                else {
                // Default navigation behavior (for RequirementView)
                    const detailBasePath = `${basePath.value}/${requirement.id}`

                    switch (action) {
                        case 'review':
                            await navigateTo(`${detailBasePath}/review`)
                            break
                        case 'revise':
                            await navigateTo(`${detailBasePath}/edit`)
                            break
                        case 'remove':
                        case 'restore':
                        // Navigate back to the list after remove/restore
                            await navigateTo(basePath.value)
                            break
                        default:
                            await navigateTo(basePath.value)
                    }
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error)

                // Special handling for Active revision conflicts (documented behavior)
                if (action === 'revise' && requirement.workflowState === WorkflowState.Active
                    && (message.includes('newer versions') || message.includes('Proposed or Review'))) {
                    toast.add({
                        icon: 'i-lucide-alert-triangle',
                        title: 'Revision Blocked',
                        description: `Cannot revise "${requirement.name}" because there are already newer versions in Proposed or Review states. Only one revision process can be active at a time.`,
                        color: 'warning'
                    })
                } else {
                    toast.add({
                        icon: 'i-lucide-alert-circle',
                        title: 'Error',
                        description: `Error ${action}ing requirement: ${message}`,
                        color: 'error'
                    })
                }
            }
        }

    return {
        performWorkflowAction
    }
}
