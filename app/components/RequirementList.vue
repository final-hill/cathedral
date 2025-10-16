<script lang="tsx" setup>
import type * as req from '#shared/domain/requirements'
import type { ReqType } from '#shared/domain/requirements/ReqType'
import type { TableColumn } from '@nuxt/ui'
import { UBadge, UButton, UTable, UDropdownMenu, XConfirmModal, USelectMenu, UFormField } from '#components'
import { WorkflowState } from '#shared/domain/requirements/enums'
import { uiBasePathTemplates } from '#shared/domain/requirements/uiBasePathTemplates'
import { workflowColorMap } from '#shared/utils/workflow-colors'
import { snakeCaseToTitleCase } from '#shared/utils'
import { SINGLETON_REQUIREMENT_TYPES } from '#shared/domain/requirements/singletonRequirements'

type WorkflowAction = 'review' | 'remove' | 'revise' | 'restore'

const props = defineProps<{
        requirements: req.RequirementType[]
        reqType: ReqType
        organizationSlug: string
        solutionSlug: string
        loading?: boolean
        hideHeader?: boolean
        hideNew?: boolean
        parentReferences?: Record<string, string> // field name -> parent ID for OneToMany relationships
        selectedWorkflowStates?: WorkflowState[]
    }>(),
    emit = defineEmits<{
        'refresh': []
        'update:selectedWorkflowStates': [states: WorkflowState[]]
    }>(),
    { requirements, reqType, organizationSlug, solutionSlug, loading = false, hideHeader = false, hideNew = false, parentReferences, selectedWorkflowStates } = toRefs(props),
    router = useRouter(),
    toast = useToast(),
    overlay = useOverlay(),
    confirmModal = overlay.create(XConfirmModal, {}),
    basePath = computed(() => {
        const template = uiBasePathTemplates[reqType.value as keyof typeof uiBasePathTemplates]
        return template
            .replace('[org]', organizationSlug.value)
            .replace('[solutionslug]', solutionSlug.value)
    }),
    // Default to Proposed, Active, and Review states
    internalSelectedStates = ref<WorkflowState[]>(selectedWorkflowStates?.value ?? [WorkflowState.Proposed, WorkflowState.Active, WorkflowState.Review]),
    workflowStateOptions = computed(() =>
        Object.values(WorkflowState).map(state => ({
            label: state,
            value: state,
            color: workflowColorMap[state]
        }))
    ),
    filteredRequirements = computed(() => {
        if (!internalSelectedStates.value.length) return requirements.value
        return requirements.value.filter(req =>
            internalSelectedStates.value.includes(req.workflowState)
        )
    }),
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
            onSelect: () => { router.push(`${basePath.value}/${requirement.id}`) }
        })

        // Edit/Revise actions - based on workflow state
        if (requirement.workflowState === WorkflowState.Proposed) {
            actions.push({
                label: 'Edit',
                icon: 'i-lucide-pen',
                color: 'primary',
                onSelect: () => { router.push(`${basePath.value}/${requirement.id}/edit`) }
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
                        onSelect: () => { performWorkflowAction({ requirement, action: 'review' }) }
                    },
                    {
                        label: 'Remove',
                        icon: 'i-lucide-trash-2',
                        color: 'error',
                        onSelect: () => confirmAndPerformAction({ requirement, action: 'remove', confirmMessage: `Are you sure you want to remove requirement "${requirement.name}"?` })
                    }
                )
                break
            case WorkflowState.Review:
                actions.push({
                    label: 'Review',
                    icon: 'i-lucide-clipboard-check',
                    color: 'warning',
                    onSelect: () => { router.push(`${basePath.value}/${requirement.id}/review`) }
                })
                break
            case WorkflowState.Active:
                actions.push({
                    label: 'Revise',
                    icon: 'i-lucide-pen',
                    color: 'info',
                    onSelect: () => { performWorkflowAction({ requirement, action: 'revise' }) }
                })

                // Singleton requirements cannot be removed when Active (they are essential)
                if (!SINGLETON_REQUIREMENT_TYPES.includes(requirement.reqType)) {
                    actions.push({
                        label: 'Remove',
                        icon: 'i-lucide-trash-2',
                        color: 'error',
                        onSelect: () => confirmAndPerformAction({ requirement, action: 'remove', confirmMessage: `Are you sure you want to remove requirement "${requirement.name}"?` })
                    })
                }
                break
            case WorkflowState.Rejected:
                actions.push(
                    {
                        label: 'Revise',
                        icon: 'i-lucide-edit',
                        color: 'info',
                        onSelect: () => { performWorkflowAction({ requirement, action: 'revise' }) }
                    },
                    {
                        label: 'Remove',
                        icon: 'i-lucide-trash-2',
                        color: 'error',
                        onSelect: () => confirmAndPerformAction({ requirement, action: 'remove', confirmMessage: `Are you sure you want to remove requirement "${requirement.name}"?` })
                    }
                )
                break
            case WorkflowState.Removed:
                actions.push({
                    label: 'Restore',
                    icon: 'i-lucide-refresh-cw',
                    color: 'neutral',
                    onSelect: () => { performWorkflowAction({ requirement, action: 'restore' }) }
                })
                break
        }

        return actions
    },
    performWorkflowAction = async ({ requirement, action }: { requirement: req.RequirementType, action: WorkflowAction }) => {
        try {
            let endpoint: string

            switch (action) {
                case 'review':
                    endpoint = `/api/requirements/${reqType.value}/proposed/${requirement.id}/review`
                    break
                case 'revise':
                    if (requirement.workflowState === WorkflowState.Rejected)
                        endpoint = `/api/requirements/${reqType.value}/rejected/${requirement.id}/revise`
                    else if (requirement.workflowState === WorkflowState.Active)
                        endpoint = `/api/requirements/${reqType.value}/active/${requirement.id}/edit`
                    else
                        throw new Error(`Invalid revise action for requirement in ${requirement.workflowState} state`)

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
    confirmAndPerformAction = async ({ requirement, action, confirmMessage }: { requirement: req.RequirementType, action: WorkflowAction, confirmMessage: string }) => {
        const result = await confirmModal.open({
            title: confirmMessage
        }).result

        if (result)
            await performWorkflowAction({ requirement, action })
    },
    createNewRequirement = () => {
        const url = new URL(`${basePath.value}/new`, window.location.origin)

        // Add parent references as query parameters
        if (parentReferences?.value) {
            Object.entries(parentReferences.value).forEach(([field, id]) => {
                url.searchParams.set(field, id)
            })
        }

        router.push(url.pathname + url.search)
    }

// Watch for changes to external prop and sync internal state
watch(selectedWorkflowStates, (newStates) => {
    if (newStates)
        internalSelectedStates.value = [...newStates]
}, { immediate: true })

// Watch for changes to internal state and emit to parent
watch(internalSelectedStates, (newStates) => {
    emit('update:selectedWorkflowStates', [...newStates])
}, { deep: true })
</script>

<template>
    <div class="mt-4">
        <div
            v-if="!hideHeader"
            class="flex items-center justify-between mb-6"
        >
            <h2 class="text-xl font-semibold">
                Requirements
            </h2>
            <div class="flex items-center gap-4">
                <UFormField
                    label="Filter by Status:"
                    size="md"
                    class="min-w-48"
                >
                    <USelectMenu
                        v-model="internalSelectedStates"
                        :items="workflowStateOptions"
                        multiple
                        placeholder="Select states..."
                        value-key="value"
                        :ui="{
                            base: 'min-w-48'
                        }"
                    >
                        <template #default>
                            <span
                                v-if="internalSelectedStates.length === 0"
                                class="text-muted"
                            >
                                All States
                            </span>
                            <span v-else-if="internalSelectedStates.length === 1">
                                {{ internalSelectedStates[0] }}
                            </span>
                            <span v-else>
                                {{ internalSelectedStates.length }} states selected
                            </span>
                        </template>
                    </USelectMenu>
                </UFormField>
                <UFormField
                    v-if="!hideNew"
                    label="&nbsp;"
                    size="md"
                >
                    <UButton
                        color="success"
                        icon="i-lucide-plus"
                        :label="'New ' + snakeCaseToTitleCase(reqType)"
                        @click="createNewRequirement"
                    />
                </UFormField>
            </div>
        </div>

        <UTable
            :columns="columns"
            :data="filteredRequirements"
            :loading="loading"
            class="mt-4"
            :empty-state="{ icon: 'i-lucide-database', label: 'No requirements found.' }"
        />
    </div>
</template>
