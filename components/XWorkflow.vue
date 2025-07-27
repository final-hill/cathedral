<script lang="tsx" setup>
import type { BadgeProps, DropdownMenuItem, TableColumn, ChipProps } from '@nuxt/ui'
import type { Table } from '@tanstack/table-core'
import { UButton, UDropdownMenu, UBadge, UTable, XConfirmModal, UCheckbox } from '#components'
import { z } from 'zod'
import { ReqType, WorkflowState, MoscowPriority } from '#shared/domain'
import * as req from '#shared/domain/requirements'
import { reqIdPattern } from '#shared/domain/requirements/reqIdPattern'
import { snakeCaseToPascalCase, getSchemaFields, dedent } from '#shared/utils'

// Type for the table element with the TanStack Table API
interface TableElement extends HTMLElement {
    tableApi?: Table<SchemaType>
}

const props = defineProps<{
    reqType: ReqType
    organizationSlug: string
    solutionSlug: string
    disableNewRequirement?: boolean
    // TODO: this is hacky
    parsedReqParentId?: string
}>()

const router = useRouter(),
    reqTypePascal = snakeCaseToPascalCase(props.reqType) as keyof typeof req,
    RequirementSchema = req[reqTypePascal],
    innerSchema = RequirementSchema instanceof z.ZodEffects
        ? RequirementSchema._def.schema
        : RequirementSchema

type SchemaType = z.infer<typeof innerSchema>

const emit = defineEmits<{
    (event: 'workflow-active-items' | 'workflow-non-active-items', items: SchemaType[]): void
}>()

const { $eventBus } = useNuxtApp(),
    overlay = useOverlay(),
    confirmRemoveModal = overlay.create(XConfirmModal, {}),
    workflowTable = useTemplateRef<TableElement>('workflowTable'),
    toast = useToast()

const { data, refresh, status, error } = await useFetch<SchemaType[]>(`/api/requirements/${props.reqType}`, {
    query: {
        solutionSlug: props.solutionSlug,
        organizationSlug: props.organizationSlug,
        ...(props.parsedReqParentId ? { parsedReqParentId: props.parsedReqParentId } : {})
    },
    transform: data => data.map(item => req[reqTypePascal].parse({
        ...item,
        creationDate: new Date(item.creationDate),
        lastModified: new Date(item.lastModified)
    })) as SchemaType[]
})

if (error.value)
    $eventBus.$emit('page-error', error.value)

// Emit events for WorkflowState.Active and non-Active items
if (data.value) {
    const activeItems = data.value.filter(item => item.workflowState === WorkflowState.Active),
        nonActiveItems = data.value.filter(item => item.workflowState !== WorkflowState.Active)

    emit('workflow-active-items', activeItems)
    emit('workflow-non-active-items', nonActiveItems)
}

const createSchema = props.reqType === ReqType.PARSED_REQUIREMENTS
    ? req.ParsedRequirements.pick({
            description: true
        })
    : (innerSchema as typeof req.Requirement).omit({
            reqId: true,
            // @ts-expect-error: this property exists on some subtypes of Requirement
            reqIdPrefix: true,
            createdBy: true,
            creationDate: true,
            lastModified: true,
            id: true,
            reqType: true,
            isDeleted: true,
            modifiedBy: true,
            solution: true
        })

const viewSchema = props.reqType === ReqType.PARSED_REQUIREMENTS
    ? req.ParsedRequirements.pick({
            name: true,
            description: true,
            requirements: true
        })
    : (innerSchema as typeof req.Requirement).omit({
            reqType: true,
            // @ts-expect-error: this property exists on some subtypes of Requirement
            reqIdPrefix: true,
            createdBy: true,
            creationDate: true,
            lastModified: true,
            id: true,
            isDeleted: true,
            modifiedBy: true,
            solution: true,
            parsedRequirements: true
        })

const editSchema = props.reqType === ReqType.PARSED_REQUIREMENTS
    ? req.ParsedRequirements.pick({
            description: true
        })
    : (innerSchema as typeof req.Requirement).omit({
            workflowState: true,
            reqId: true,
            // @ts-expect-error: this property exists on some subtypes of Requirement
            reqIdPrefix: true,
            createdBy: true,
            creationDate: true,
            lastModified: true,
            id: true,
            reqType: true,
            isDeleted: true,
            modifiedBy: true,
            solution: true,
            parsedRequirements: true
        })

const workflowColorMap: Record<WorkflowState, BadgeProps['color']> = {
    [WorkflowState.Proposed]: 'info',
    [WorkflowState.Rejected]: 'error',
    [WorkflowState.Removed]: 'neutral',
    [WorkflowState.Review]: 'warning',
    [WorkflowState.Active]: 'success',
    [WorkflowState.Parsed]: 'neutral'
}

const priorityColorMap: Record<MoscowPriority, BadgeProps['color']> = {
    [MoscowPriority.MUST]: 'error',
    [MoscowPriority.SHOULD]: 'warning',
    [MoscowPriority.COULD]: 'info',
    [MoscowPriority.WONT]: 'neutral'
}

const viewDataColumns = getSchemaFields(viewSchema).map(({ key, label }) => {
    const column: TableColumn<SchemaType> = {
        accessorKey: key,
        header: ({ column }) => {
            const isSorted = column.getIsSorted()

            return (
                <UButton
                    label={label}
                    color="neutral"
                    variant="ghost"
                    icon={
                        isSorted
                            ? isSorted === 'asc'
                                ? 'i-lucide-arrow-up-narrow-wide'
                                : 'i-lucide-arrow-down-wide-narrow'
                            : 'i-lucide-arrow-up-down'
                    }
                    class="-mx-2.5"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                />
            )
        },
        cell: ({ row }) => {
            const cellValue = row.original[key as keyof SchemaType] as unknown

            switch (true) {
                case WorkflowState[cellValue as WorkflowState] !== undefined:
                    return <UBadge color={workflowColorMap[cellValue as WorkflowState]} label={cellValue as string} />
                case MoscowPriority[cellValue as MoscowPriority] !== undefined:
                    return <UBadge color={priorityColorMap[cellValue as MoscowPriority]} label={cellValue as string} />
                case typeof cellValue === 'string':
                case typeof cellValue === 'number':
                    return <p class="max-w-2xl truncate">{cellValue}</p>
                case cellValue instanceof Date:
                    return <time datetime={cellValue.toISOString()}>{cellValue.toLocaleString()}</time>
                case typeof cellValue === 'boolean':
                    return <UCheckbox modelValue={cellValue} disabled />
                case typeof cellValue === 'object' && cellValue !== null && 'id' in cellValue && 'name' in cellValue:
                    return cellValue.name
                case props.reqType === ReqType.PARSED_REQUIREMENTS && key === 'requirements':
                    return (
                        <span class="text-sm">
                            {(cellValue as unknown[]).length}
                            {' '}
                            requirements
                        </span>
                    )
                default:
                    return cellValue
            }
        },
        ...key === 'reqId'
            ? {
                    sortingFn: (a: { original: Record<string, unknown> }, b: { original: Record<string, unknown> }, columnId: string) => {
                        const aSuffix = (a.original[columnId] as string)?.match(reqIdPattern)?.[2],
                            bSuffix = (b.original[columnId] as string)?.match(reqIdPattern)?.[2]
                        return aSuffix && bSuffix ? +aSuffix - +bSuffix : 0
                    }
                }
            : {}
    }
    return column
})

const actionColumn: TableColumn<SchemaType> = {
    header: 'Actions',
    cell: ({ row }) => {
        const item = row.original,
            actionItems = props.reqType === ReqType.PARSED_REQUIREMENTS
                ? getParsedReqsActionItems(item)
                : getDefaultActionItems(item)

        return (
            <div class="text-left">
                <UDropdownMenu items={actionItems}>
                    <UButton
                        class="ml-auto"
                        icon="i-lucide-ellipsis-vertical"
                        color="neutral"
                        variant="ghost"
                        aria-label="Actions dropdown"
                    />
                </UDropdownMenu>
            </div>
        )
    }
}

const editProposedModalOpenState = ref(false),
    editProposedModalItem = ref<SchemaType>({} as SchemaType)

const openEditProposedModal = (item: SchemaType) => {
    editProposedModalItem.value = { ...item }
    editProposedModalOpenState.value = true
}

const onEditProposedModalSubmit = async (_: unknown) => {
    await $fetch(`/api/requirements/${props.reqType}/proposed/${editProposedModalItem.value?.id}/edit`, {
        method: 'POST',
        body: {
            ...editProposedModalItem.value,
            solutionSlug: props.solutionSlug,
            organizationSlug: props.organizationSlug
        }
    }).then(() => {
        toast.add({ icon: 'i-lucide-check', title: 'Success', description: 'Requirement updated successfully' })
        refresh()
    }).catch((error) => {
        toast.add({ icon: 'i-lucide-alert-circle', title: 'Error', description: `Error updating requirement: ${error}` })
    }).finally(() => {
        editProposedModalItem.value = Object.create(null)
        editProposedModalOpenState.value = false
    })
}

const onEditProposedModalReset = () => {
    editProposedModalItem.value = Object.create(null)
    editProposedModalOpenState.value = false
}

const editRejectedModalOpenState = ref(false),
    editRejectedModalItem = ref<SchemaType>({} as SchemaType)

const openEditRejectedModal = (item: SchemaType) => {
    editRejectedModalItem.value = { ...item }
    editRejectedModalOpenState.value = true
}

const onEditRejectedModalSubmit = async (_: unknown) => {
    await $fetch(`/api/requirements/${props.reqType}/rejected/${editRejectedModalItem.value?.id}/revise`, {
        method: 'POST',
        body: {
            solutionSlug: props.solutionSlug,
            organizationSlug: props.organizationSlug
        }
    }).then(() => {
        toast.add({ icon: 'i-lucide-check', title: 'Success', description: 'Requirement revised successfully' })
        refresh()
    }).catch((error) => {
        toast.add({ icon: 'i-lucide-alert-circle', title: 'Error', description: `Error revising requirement: ${error}` })
    }).finally(() => {
        editRejectedModalItem.value = Object.create(null)
        editRejectedModalOpenState.value = false
    })
}

const onEditRejectedModalReset = () => {
    editRejectedModalItem.value = Object.create(null)
    editRejectedModalOpenState.value = false
}

const editActiveModalOpenState = ref(false),
    editActiveModalItem = ref<SchemaType>({} as SchemaType),
    revisionBlockedModalOpenState = ref(false),
    revisionBlockedModalMessage = ref('')

const openEditActiveModal = (item: SchemaType) => {
    editActiveModalItem.value = { ...item }
    editActiveModalOpenState.value = true
}

const onEditActiveModalSubmit = async (_: unknown) => {
    await $fetch(`/api/requirements/${props.reqType}/active/${editActiveModalItem.value?.id}/edit`, {
        method: 'POST',
        body: {
            solutionSlug: props.solutionSlug,
            organizationSlug: props.organizationSlug
        }
    }).then(() => {
        toast.add({ icon: 'i-lucide-check', title: 'Success', description: 'Requirement revised successfully' })
        refresh()
        editActiveModalItem.value = Object.create(null)
        editActiveModalOpenState.value = false
    }).catch((error) => {
        const errorMessage = error.data?.message || error.message || 'Unknown error'

        // Check if this is a conflict error about newer versions
        if (errorMessage.includes('newer versions') || errorMessage.includes('Proposed or Review')) {
            revisionBlockedModalMessage.value = dedent(`
                Cannot revise "${editActiveModalItem.value?.name}" because there are already newer versions in Proposed or Review states.
                Only one revision process can be active at a time to prevent conflicting changes.

                To find the newer versions, use the workflow state filter above to show only "Proposed" or "Review" requirements
                and look for other versions of "${editActiveModalItem.value?.name}".
            `)
            revisionBlockedModalOpenState.value = true
        } else {
            toast.add({ icon: 'i-lucide-alert-circle', title: 'Error', description: `Error revising requirement: ${errorMessage}` })
        }

        editActiveModalItem.value = Object.create(null)
        editActiveModalOpenState.value = false
    })
}

const onEditActiveModalReset = () => {
    editActiveModalItem.value = Object.create(null)
    editActiveModalOpenState.value = false
}

const reviewModalOpenState = ref(false),
    reviewModalItem = ref<SchemaType>({} as SchemaType)

const openReviewModal = (item: SchemaType) => {
    reviewModalItem.value = { ...item }
    reviewModalOpenState.value = true
}

const onReviewApprove = async () => {
    await $fetch(`/api/requirements/${props.reqType}/review/${reviewModalItem.value?.id}/approve`, {
        method: 'POST',
        body: {
            solutionSlug: props.solutionSlug,
            organizationSlug: props.organizationSlug
        }
    }).then(() => {
        toast.add({ icon: 'i-lucide-check', title: 'Success', description: 'Requirement approved successfully' })
        refresh()
    }).catch((error) => {
        toast.add({ icon: 'i-lucide-alert-circle', title: 'Error', description: `Error approving requirement: ${error}` })
    }).finally(() => {
        reviewModalItem.value = Object.create(null)
        reviewModalOpenState.value = false
    })
}

const onReviewReject = async () => {
    await $fetch(`/api/requirements/${props.reqType}/review/${reviewModalItem.value?.id}/reject`, {
        method: 'POST',
        body: {
            solutionSlug: props.solutionSlug,
            organizationSlug: props.organizationSlug
        }
    }).then(() => {
        toast.add({ icon: 'i-lucide-check', title: 'Success', description: 'Requirement rejected successfully' })
        refresh()
    }).catch((error) => {
        toast.add({ icon: 'i-lucide-alert-circle', title: 'Error', description: `Error rejecting requirement: ${error}` })
    }).finally(() => {
        reviewModalItem.value = Object.create(null)
        reviewModalOpenState.value = false
    })
}

const getParsedReqsActionItems = (item: SchemaType): DropdownMenuItem[] => {
    const items: DropdownMenuItem[] = [{
        label: 'View',
        icon: 'i-lucide-eye',
        color: 'info',
        onSelect: () => {
            router.push({
                name: 'Parsed Requirements Details',
                params: {
                    organizationslug: props.organizationSlug,
                    solutionslug: props.solutionSlug,
                    id: item.id
                }
            })
        }
    }]
    switch (item.workflowState) {
        case WorkflowState.Proposed:
        case WorkflowState.Review:
        case WorkflowState.Rejected:
        case WorkflowState.Removed:
        case WorkflowState.Active:
        case WorkflowState.Parsed:
            return items
        default:
            return items
    }
}

const getDefaultActionItems = (item: SchemaType): DropdownMenuItem[] => {
    // Special handling for ParsedRequirements
    if (item.reqType === ReqType.PARSED_REQUIREMENTS) {
        return getParsedReqsActionItems(item)
    }

    // Special handling for Silence requirements
    if (item.reqType === ReqType.SILENCE) {
        return getSilenceActionItems(item)
    }

    switch (item.workflowState) {
        case WorkflowState.Proposed:
            return [{
                label: 'Edit',
                icon: 'i-lucide-pen',
                color: 'info',
                onSelect: () => openEditProposedModal(item)
            }, {
                label: 'Submit',
                icon: 'i-lucide-check-circle',
                color: 'warning',
                onSelect: () => {
                    $fetch(`/api/requirements/${props.reqType}/proposed/${item.id}/review`, {
                        method: 'POST',
                        body: {
                            solutionSlug: props.solutionSlug,
                            organizationSlug: props.organizationSlug
                        }
                    }).then(() => {
                        toast.add({ icon: 'i-lucide-check', title: 'Success', description: 'Requirement submitted for review' })
                        refresh()
                    }).catch((error) => {
                        toast.add({ icon: 'i-lucide-alert-circle', title: 'Error', description: `Error submitting requirement: ${error}` })
                    })
                }
            }, {
                label: 'Remove',
                icon: 'i-lucide-trash-2',
                color: 'error',
                onSelect: async () => {
                    const result = await confirmRemoveModal.open({
                        title: `Are you sure you want to remove requirement '${item.name}'?`
                    }).result
                    if (result) {
                        $fetch(`/api/requirements/${props.reqType}/proposed/${item.id}/remove`, {
                            method: 'POST',
                            body: {
                                solutionSlug: props.solutionSlug,
                                organizationSlug: props.organizationSlug
                            }
                        }).then(() => {
                            toast.add({ icon: 'i-lucide-check', title: 'Success', description: 'Requirement removed successfully' })
                            refresh()
                        }).catch((error) => {
                            toast.add({ icon: 'i-lucide-alert-circle', title: 'Error', description: `Error removing requirement: ${error}` })
                        })
                    }
                }
            }]
        case WorkflowState.Review:
            return [{
                label: 'Review',
                icon: 'i-lucide-eye',
                color: 'info',
                onSelect: () => openReviewModal(item)
            }]
        case WorkflowState.Rejected:
            return [{
                label: 'Revise',
                icon: 'i-lucide-edit',
                color: 'info',
                onSelect: () => openEditRejectedModal(item)
            }, {
                label: 'Remove',
                icon: 'i-lucide-trash-2',
                color: 'error',
                onSelect: async () => {
                    const result = await confirmRemoveModal.open({
                        title: `Are you sure you want to remove requirement '${item.name}'?`
                    }).result
                    if (result) {
                        $fetch(`/api/requirements/${props.reqType}/rejected/${item.id}/remove`, {
                            method: 'POST',
                            body: {
                                solutionSlug: props.solutionSlug,
                                organizationSlug: props.organizationSlug
                            }
                        }).then(() => {
                            toast.add({ icon: 'i-lucide-check', title: 'Success', description: 'Requirement removed successfully' })
                            refresh()
                        }).catch((error) => {
                            toast.add({ icon: 'i-lucide-alert-circle', title: 'Error', description: `Error removing requirement: ${error}` })
                        })
                    }
                }
            }]
        case WorkflowState.Removed:
            return [{
                label: 'Restore',
                icon: 'i-lucide-refresh-cw',
                color: 'neutral',
                onSelect: () => {
                    $fetch(`/api/requirements/${props.reqType}/removed/${item.id}/restore`, {
                        method: 'POST',
                        body: {
                            solutionSlug: props.solutionSlug,
                            organizationSlug: props.organizationSlug
                        }
                    }).then(() => {
                        toast.add({ icon: 'i-lucide-check', title: 'Success', description: 'Requirement restored successfully' })
                        refresh()
                    }).catch((error) => {
                        toast.add({ icon: 'i-lucide-alert-circle', title: 'Error', description: `Error restoring requirement: ${error}` })
                    })
                }
            }]
        case WorkflowState.Active:
            return getActiveRequirementActions(item)
        case WorkflowState.Parsed:
            // ParsedRequirements have no workflow actions - they are non-actionable containers
            return []
        default:
            return []
    }
}

const getActiveRequirementActions = (item: SchemaType): DropdownMenuItem[] => {
    const actions: DropdownMenuItem[] = []

    // Always show Revise action
    actions.push({
        label: 'Revise',
        icon: 'i-lucide-pen',
        color: 'info',
        onSelect: () => openEditActiveModal(item)
    })

    // Always show Remove action
    actions.push({
        label: 'Remove',
        icon: 'i-lucide-trash-2',
        color: 'error',
        onSelect: async () => {
            const result = await confirmRemoveModal.open({
                title: `Are you sure you want to remove requirement '${item.name}'?`
            }).result
            if (result) {
                $fetch(`/api/requirements/${props.reqType}/active/${item.id}/remove`, {
                    method: 'POST',
                    body: {
                        solutionSlug: props.solutionSlug,
                        organizationSlug: props.organizationSlug
                    }
                }).then(() => {
                    toast.add({ icon: 'i-lucide-check', title: 'Success', description: 'Requirement removed successfully' })
                    refresh()
                }).catch((error) => {
                    toast.add({ icon: 'i-lucide-alert-circle', title: 'Error', description: `Error removing requirement: ${error}` })
                })
            }
        }
    })

    return actions
}

const getSilenceActionItems = (item: SchemaType): DropdownMenuItem[] => {
    switch (item.workflowState) {
        case WorkflowState.Rejected:
            // Silence requirements can only be removed when in Rejected state
            return [{
                label: 'Remove',
                icon: 'i-lucide-trash-2',
                color: 'error',
                onSelect: async () => {
                    const result = await confirmRemoveModal.open({
                        title: `Are you sure you want to remove this silence requirement? This action cannot be undone. Silence requirements cannot be restored once removed.`
                    }).result
                    if (result) {
                        $fetch(`/api/requirements/${props.reqType}/rejected/${item.id}/remove`, {
                            method: 'POST',
                            body: {
                                solutionSlug: props.solutionSlug,
                                organizationSlug: props.organizationSlug
                            }
                        }).then(() => {
                            toast.add({ icon: 'i-lucide-check', title: 'Success', description: 'Silence requirement removed successfully' })
                            refresh()
                        }).catch((error) => {
                            toast.add({ icon: 'i-lucide-alert-circle', title: 'Error', description: `Error removing silence requirement: ${error}` })
                        })
                    }
                }
            }]
        case WorkflowState.Removed:
            // Silence requirements have no actions when removed - they are permanently removed
            return []
        default:
            // Silence requirements should never be in other states, but return empty array as fallback
            return []
    }
}

const workflowColumns: TableColumn<SchemaType>[] = [...viewDataColumns, actionColumn]

const columnPinning = ref({
    left: [],
    right: ['Actions']
})

const workflowColumnFilters = ref(
    props.reqType === ReqType.PARSED_REQUIREMENTS
        ? []
        : [{
                id: 'workflowState',
                value: ''
            }]
)

const workflowStateOptions = ref([
    { label: 'All', value: undefined },
    ...Object.values(WorkflowState)
        .filter(state => props.reqType !== ReqType.PARSED_REQUIREMENTS || state !== WorkflowState.Parsed)
        .map(state => ({
            label: state,
            value: state,
            chip: {
                color: workflowColorMap[state],
                label: state
            }
        }))
])

function getChip(value: WorkflowState) {
    const item = workflowStateOptions.value.find(item => item?.value === value)
    return item && 'chip' in item ? item.chip : null
}

const createModalOpenState = ref(false),
    createModalItem = ref<SchemaType>({} as SchemaType)

const openCreateModal = () => {
    createModalItem.value = Object.create(null)
    createModalOpenState.value = true
}

const onCreateModalSubmit = async (_: unknown) => {
    await $fetch(`/api/requirements/${props.reqType}/propose`, {
        method: 'PUT',
        body: props.reqType === ReqType.PARSED_REQUIREMENTS
            ? {
                    name: 'Free-form requirements',
                    description: createModalItem.value?.description,
                    solutionSlug: props.solutionSlug,
                    organizationSlug: props.organizationSlug
                }
            : {
                    ...createModalItem.value,
                    solutionSlug: props.solutionSlug,
                    organizationSlug: props.organizationSlug
                }
    }).then(() => {
        toast.add({ icon: 'i-lucide-check', title: 'Success', description: 'Requirement created successfully' })
        refresh()
    }).catch((error) => {
        toast.add({ icon: 'i-lucide-alert-circle', title: 'Error', description: `Error creating requirement: ${error}` })
    }).finally(() => {
        createModalItem.value = Object.create(null)
        createModalOpenState.value = false
    })
}

const onCreateModalReset = () => {
    createModalItem.value = Object.create(null)
    createModalOpenState.value = false
}

const showProposedAndReviewItems = () => {
    revisionBlockedModalOpenState.value = false
    // Clear current filter to show all states
    workflowTable.value?.tableApi?.getColumn('workflowState')?.setFilterValue('')
    // Focus on the filter dropdown to help user find the newer versions
    setTimeout(() => {
        const filterSelect = document.querySelector('[placeholder="Filter by Workflow State..."]')
        if (filterSelect) {
            (filterSelect as HTMLElement).focus()
        }
    }, 100)
}
</script>

<template>
    <section class="flex space-x-4 items-center px-4 py-3.5 border-b border-accented">
        <UButton
            v-if="!props.disableNewRequirement"
            label="New Requirement"
            color="success"
            size="xl"
            @click="openCreateModal"
        />
        <USelect
            v-if="props.reqType !== ReqType.PARSED_REQUIREMENTS"
            :items="workflowStateOptions"
            placeholder="Filter by Workflow State..."
            @update:model-value="workflowTable?.tableApi?.getColumn('workflowState')?.setFilterValue($event)"
        >
            <template #leading="{ modelValue, ui }">
                <UChip
                    v-if="modelValue"
                    v-bind="getChip(modelValue as WorkflowState)"
                    inset
                    standalone
                    :size="(ui.itemLeadingChipSize() as ChipProps['size'])"
                    :class="ui.itemLeadingChip()"
                />
            </template>
        </USelect>
    </section>
    <UTable
        ref="workflowTable"
        v-model:column-filters="workflowColumnFilters"
        v-model:column-pinning="columnPinning"
        sticky
        :data="data ?? []"
        :columns="workflowColumns"
        :loading="status === 'pending'"
        :empty-state="{ icon: 'i-lucide-database', label: 'No items.' }"
        class="min-h-fit"
    />

    <UModal
        v-model:open="createModalOpenState"
        title="New Requirement"
    >
        <template #body>
            <XForm
                v-model:state="createModalItem"
                :schema="createSchema"
                :on-submit="onCreateModalSubmit"
                :on-cancel="onCreateModalReset"
            />
        </template>
    </UModal>

    <UModal
        v-model:open="editProposedModalOpenState"
        title="Edit Proposal"
    >
        <template #body>
            <XForm
                :state="editProposedModalItem"
                :schema="editSchema"
                :on-submit="onEditProposedModalSubmit"
                :on-cancel="onEditProposedModalReset"
            />
        </template>
    </UModal>

    <UModal
        v-model:open="editRejectedModalOpenState"
        title="Revise Rejected Requirement"
    >
        <template #body>
            <XForm
                :state="editRejectedModalItem"
                :schema="editSchema"
                :on-submit="onEditRejectedModalSubmit"
                :on-cancel="onEditRejectedModalReset"
            />
        </template>
    </UModal>

    <UModal
        v-model:open="editActiveModalOpenState"
        title="Revise Active Requirement"
    >
        <template #body>
            <XForm
                :state="editActiveModalItem"
                :schema="editSchema"
                :on-submit="onEditActiveModalSubmit"
                :on-cancel="onEditActiveModalReset"
            />
        </template>
    </UModal>

    <UModal
        v-model:open="reviewModalOpenState"
        title="Review Requirement"
    >
        <template #body>
            <p>
                Below are the details of the requirement to be reviewed.

                The <strong>Req Id</strong> field will be auto-generated once the
                requirement is approved.
            </p>

            <hr class="my-6">

            <XForm
                :state="reviewModalItem"
                :schema="viewSchema"
                :disabled="true"
                :on-submit="onReviewApprove"
                :on-cancel="onReviewReject"
            />
        </template>
        <template #footer>
            <UButton
                label="Approve"
                color="success"
                @click="onReviewApprove"
            />
            <UButton
                label="Reject"
                color="error"
                @click="onReviewReject"
            />
        </template>
    </UModal>

    <UModal
        v-model:open="revisionBlockedModalOpenState"
        title="Revision Blocked"
    >
        <template #body>
            <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                    <UIcon
                        name="i-lucide-alert-triangle"
                        class="h-6 w-6 text-warning"
                    />
                </div>
                <div class="flex-1">
                    <h3 class="text-sm font-medium text-highlighted mb-2">
                        Cannot Revise Requirement
                    </h3>
                    <p class="text-sm text-muted whitespace-pre-line">
                        {{ revisionBlockedModalMessage }}
                    </p>
                </div>
            </div>
        </template>
        <template #footer>
            <UButton
                label="Show Proposed & Review Items"
                color="neutral"
                variant="outline"
                @click="showProposedAndReviewItems"
            />
            <UButton
                label="OK"
                color="primary"
                @click="revisionBlockedModalOpenState = false"
            />
        </template>
    </UModal>
</template>
