<script lang="tsx" setup>
import type * as req from '#shared/domain/requirements'
import type { ReqType } from '#shared/domain/requirements/enums'
import type { TableColumn } from '@nuxt/ui'
import { UBadge, UButton, UTable, UDropdownMenu } from '#components'
import { WorkflowState } from '#shared/domain/requirements/enums'
import { workflowColorMap } from '#shared/utils'

type WorkflowAction = 'review' | 'remove' | 'approve' | 'reject' | 'revise' | 'restore'

const props = defineProps<{
    requirements: req.RequirementType[]
    reqType: ReqType
    organizationSlug: string
    solutionSlug: string
    loading?: boolean
    hideHeader?: boolean
}>(),
    emit = defineEmits<{
        refresh: []
    }>(),
    { requirements, reqType, organizationSlug, solutionSlug, loading = false, hideHeader = false } = toRefs(props),
    router = useRouter(),
    route = useRoute(),
    toast = useToast(),
    getPegsFromReqIdPrefix = (reqIdPrefix: string): string => {
        const prefixMap = new Map([
                ['P', 'project'],
                ['E', 'environment'],
                ['G', 'goals'],
                ['S', 'system']
            ]),
            prefix = reqIdPrefix.charAt(0).toUpperCase()
        return prefixMap.get(prefix)!
    },
    getBasePath = (requirement: req.RequirementType): string => {
        const pegs = getPegsFromReqIdPrefix(requirement.reqIdPrefix!)
        return `/o/${organizationSlug.value}/${solutionSlug.value}/${pegs}/${requirement.reqType}`
    },
    columns: TableColumn<req.RequirementType>[] = [
        {
            id: 'reqId',
            accessorKey: 'reqId',
            header: 'ID',
            cell: ({ row }) => {
                const reqId = row.getValue('reqId')
                return reqId
                    ? <UBadge label={reqId as string} color="neutral" variant="solid" />
                    : <span class="text-muted">—</span>
            }
        },
        {
            id: 'name',
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => {
                return <span>{row.getValue('name') as string}</span>
            }
        },
        {
            id: 'workflowState',
            accessorKey: 'workflowState',
            header: 'Status',
            cell: ({ row }) => {
                const workflowState = row.getValue('workflowState') as WorkflowState | undefined
                if (!workflowState) return <span class="text-muted">—</span>
                return (
                    <UBadge
                        label={workflowState}
                        color={workflowColorMap[workflowState]}
                        variant="solid"
                    />
                )
            }
        },
        {
            id: 'lastModified',
            accessorKey: 'lastModified',
            header: 'Modified',
            cell: ({ row }) => {
                const dateValue = row.getValue('lastModified') as Date | string | undefined
                if (!dateValue) return <span class="text-muted">—</span>

                const date = dateValue instanceof Date ? dateValue : new Date(dateValue)
                return <time datetime={date.toISOString()}>{date.toLocaleString()}</time>
            }
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                return (
                    <div class="text-right">
                        <UDropdownMenu items={getWorkflowActions(row.original)}>
                            <UButton
                                icon="i-lucide-ellipsis-vertical"
                                color="neutral"
                                variant="ghost"
                                aria-label="Actions"
                            />
                        </UDropdownMenu>
                    </div>
                )
            }
        }
    ],
    getWorkflowActions = (requirement: req.RequirementType) => {
        const actions: Array<{
            label: string
            icon: string
            color?: 'success' | 'error' | 'info' | 'neutral' | 'warning' | 'primary' | 'secondary'
            onSelect: () => void
        }> = []

        // View action - always available
        actions.push({
            label: 'View',
            icon: 'i-lucide-eye',
            color: 'info',
            onSelect: () => { router.push(`${getBasePath(requirement)}/${requirement.id}`) }
        })

        // Edit/Revise actions - based on workflow state
        if (requirement.workflowState === WorkflowState.Proposed) {
            actions.push({
                label: 'Edit',
                icon: 'i-lucide-pen',
                color: 'primary',
                onSelect: () => { router.push(`${getBasePath(requirement)}/${requirement.id}/edit`) }
            })
        }

        // Active requirements don't get direct edit - they get revise which creates new versions
        // This is handled in the workflow state switch below

        // State transition actions
        switch (requirement.workflowState) {
            case WorkflowState.Proposed:
                actions.push(
                    {
                        label: 'Submit for Review',
                        icon: 'i-lucide-check-circle',
                        color: 'warning',
                        onSelect: () => { performWorkflowAction(requirement, 'review') }
                    },
                    {
                        label: 'Remove',
                        icon: 'i-lucide-trash-2',
                        color: 'error',
                        onSelect: () => confirmAndPerformAction(requirement, 'remove', `Are you sure you want to remove requirement "${requirement.name}"?`)
                    }
                )
                break
            case WorkflowState.Review:
                actions.push(
                    {
                        label: 'Review',
                        icon: 'i-lucide-clipboard-check',
                        color: 'warning',
                        onSelect: () => { router.push(`${getBasePath(requirement)}/${requirement.id}/review`) }
                    },
                    {
                        label: 'Quick Approve',
                        icon: 'i-lucide-check',
                        color: 'success',
                        onSelect: () => { performWorkflowAction(requirement, 'approve') }
                    },
                    {
                        label: 'Quick Reject',
                        icon: 'i-lucide-x',
                        color: 'error',
                        onSelect: () => { performWorkflowAction(requirement, 'reject') }
                    }
                )
                break
            case WorkflowState.Active:
                actions.push(
                    {
                        label: 'Revise',
                        icon: 'i-lucide-pen',
                        color: 'info',
                        onSelect: () => { performWorkflowAction(requirement, 'revise') }
                    },
                    {
                        label: 'Remove',
                        icon: 'i-lucide-trash-2',
                        color: 'error',
                        onSelect: () => confirmAndPerformAction(requirement, 'remove', `Are you sure you want to remove requirement "${requirement.name}"?`)
                    }
                )
                break
            case WorkflowState.Rejected:
                actions.push(
                    {
                        label: 'Revise',
                        icon: 'i-lucide-edit',
                        color: 'info',
                        onSelect: () => { performWorkflowAction(requirement, 'revise') }
                    },
                    {
                        label: 'Remove',
                        icon: 'i-lucide-trash-2',
                        color: 'error',
                        onSelect: () => confirmAndPerformAction(requirement, 'remove', `Are you sure you want to remove requirement "${requirement.name}"?`)
                    }
                )
                break
            case WorkflowState.Removed:
                actions.push({
                    label: 'Restore',
                    icon: 'i-lucide-refresh-cw',
                    color: 'neutral',
                    onSelect: () => { performWorkflowAction(requirement, 'restore') }
                })
                break
        }

        return actions
    },
    performWorkflowAction = async (requirement: req.RequirementType, action: WorkflowAction) => {
        try {
            let endpoint: string

            switch (action) {
                case 'review':
                    endpoint = `/api/requirements/${reqType.value}/proposed/${requirement.id}/review`
                    break
                case 'approve':
                    endpoint = `/api/requirements/${reqType.value}/review/${requirement.id}/approve`
                    break
                case 'reject':
                    endpoint = `/api/requirements/${reqType.value}/review/${requirement.id}/reject`
                    break
                case 'revise':
                    if (requirement.workflowState === WorkflowState.Rejected) {
                        endpoint = `/api/requirements/${reqType.value}/rejected/${requirement.id}/revise`
                    } else if (requirement.workflowState === WorkflowState.Active) {
                        endpoint = `/api/requirements/${reqType.value}/active/${requirement.id}/edit`
                    } else {
                        throw new Error(`Invalid revise action for requirement in ${requirement.workflowState} state`)
                    }
                    break
                case 'remove':
                    endpoint = `/api/requirements/${reqType.value}/${requirement.workflowState.toLowerCase()}/${requirement.id}/remove`
                    break
                case 'restore':
                    endpoint = `/api/requirements/${reqType.value}/removed/${requirement.id}/restore`
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

            // Navigate to appropriate detail page after successful state transition
            const detailBasePath = `${getBasePath(requirement)}/${requirement.id}`

            switch (action) {
                case 'review':
                    await navigateTo(`${detailBasePath}/review`)
                    break
                case 'revise':
                    await navigateTo(`${detailBasePath}/edit`)
                    break
                case 'approve':
                case 'reject':
                case 'remove':
                case 'restore':
                    emit('refresh')
                    break
                default:
                    emit('refresh')
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
    },
    confirmAndPerformAction = async (requirement: req.RequirementType, action: WorkflowAction, confirmMessage: string) => {
        const confirmed = confirm(confirmMessage)
        if (confirmed) {
            await performWorkflowAction(requirement, action)
        }
    },
    createNewRequirement = () => {
        const { pegs } = route.params as Record<string, string>
        router.push(`/o/${organizationSlug.value}/${solutionSlug.value}/${pegs}/${reqType.value}/new`)
    }
</script>

<template>
    <div class="requirement-list">
        <div
            v-if="!hideHeader"
            class="flex items-center justify-between mb-6"
        >
            <h2 class="text-xl font-semibold">
                Requirements
            </h2>
            <UButton
                color="success"
                icon="i-lucide-plus"
                label="New Requirement"
                @click="createNewRequirement"
            />
        </div>

        <UTable
            :columns="columns"
            :data="requirements"
            :loading="loading"
            :empty-state="{ icon: 'i-lucide-database', label: 'No requirements found.' }"
        />
    </div>
</template>

<style scoped>
.requirement-list {
    margin-top: 1rem;

    & .ut-table {
        margin-top: 1rem;
    }
}
</style>
