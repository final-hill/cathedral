<script lang="ts" setup>
import { MoscowPriority, ReqType, WorkflowState } from '#shared/domain/requirements/enums'
import type { BehaviorType, ScenarioType } from '#shared/domain/requirements'

definePageMeta({ middleware: 'auth' })

const route = useRoute(),
    toast = useToast(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug } = route.params as {
        solutionslug: string
        organizationslug: string
    }

useHead({ title: 'System Prioritization' })

// Fetch behaviors and scenarios that can have priorities
const { data: behaviors, status: behaviorsStatus, refresh: refreshBehaviors } = await useFetch<BehaviorType[]>(`/api/requirements/${ReqType.BEHAVIOR}`, {
        query: { solutionSlug, organizationSlug },
        transform: (data: unknown[]) => data as BehaviorType[]
    }),
    { data: scenarios, status: scenariosStatus, refresh: refreshScenarios } = await useFetch<ScenarioType[]>(`/api/requirements/${ReqType.SCENARIO}`, {
        query: { solutionSlug, organizationSlug },
        transform: (data: unknown[]) => data as ScenarioType[]
    }),
    allRequirements = computed(() => {
        const requirements: (BehaviorType | ScenarioType)[] = []

        if (behaviors.value) requirements.push(...behaviors.value)

        if (scenarios.value) requirements.push(...scenarios.value)

        return requirements.filter(req => req.workflowState === selectedWorkflowState.value)
    }),
    isLoading = computed(() =>
        [behaviorsStatus.value, scenariosStatus.value].some(status => status === 'pending')
    ),
    refresh = async () => {
        await Promise.all([
            refreshBehaviors(),
            refreshScenarios()
        ])
    },
    selectedWorkflowState = ref<WorkflowState>(WorkflowState.Proposed),
    workflowStateOptions = [
        { label: WorkflowState.Active, value: WorkflowState.Active },
        { label: WorkflowState.Proposed, value: WorkflowState.Proposed }
    ],
    // Track local priority changes for batch saving
    localPriorityChanges = ref<Map<string, MoscowPriority | null>>(new Map())

// Clear local changes when workflow state changes
watch(selectedWorkflowState, () => {
    localPriorityChanges.value.clear()
})

const moscowPriorityLabels: Record<MoscowPriority, string> = {
    [MoscowPriority.MUST]: 'Must Have',
    [MoscowPriority.SHOULD]: 'Should Have',
    [MoscowPriority.COULD]: 'Could Have',
    [MoscowPriority.WONT]: 'Won\'t Have'
},
    priorityOptions = [
        {
            label: moscowPriorityLabels[MoscowPriority.MUST],
            value: MoscowPriority.MUST,
            color: 'error',
            description: 'Critical to system operation',
            bgClass: 'bg-error-50 dark:bg-error-950/30',
            borderClass: 'border-error-200 dark:border-error-800'
        },
        {
            label: moscowPriorityLabels[MoscowPriority.SHOULD],
            value: MoscowPriority.SHOULD,
            color: 'warning',
            description: 'Important for system completeness',
            bgClass: 'bg-warning-50 dark:bg-warning-950/30',
            borderClass: 'border-warning-200 dark:border-warning-800'
        },
        {
            label: moscowPriorityLabels[MoscowPriority.COULD],
            value: MoscowPriority.COULD,
            color: 'info',
            description: 'Desirable but not essential',
            bgClass: 'bg-info-50 dark:bg-info-950/30',
            borderClass: 'border-info-200 dark:border-info-800'
        },
        {
            label: moscowPriorityLabels[MoscowPriority.WONT],
            value: MoscowPriority.WONT,
            color: 'neutral',
            description: 'Not required for this system currently',
            bgClass: 'bg-neutral-50 dark:bg-neutral-950/30',
            borderClass: 'border-neutral-200 dark:border-neutral-800'
        }
    ] as const,

    // Get effective priority (local override or original)
    getEffectivePriority = (requirement: BehaviorType | ScenarioType): MoscowPriority | null => {
        // Check if there's a local change first
        if (localPriorityChanges.value.has(requirement.id)) {
            const localChange = localPriorityChanges.value.get(requirement.id)
            return localChange ?? null // Handle undefined case
        }
        // Fall back to the original priority
        return requirement.priority || null
    },

    // Group requirements by their effective priority for matrix display
    requirementsByPriority = computed(() => {
        const grouped: Record<MoscowPriority | 'unset', (BehaviorType | ScenarioType)[]> = {
            [MoscowPriority.MUST]: [],
            [MoscowPriority.SHOULD]: [],
            [MoscowPriority.COULD]: [],
            [MoscowPriority.WONT]: [],
            unset: []
        }

        allRequirements.value.forEach((req) => {
            const effectivePriority = getEffectivePriority(req)
            if (effectivePriority)
                grouped[effectivePriority].push(req)
            else
                grouped.unset.push(req)
        })

        return grouped
    }),
    // Convert requirement type enum to user-friendly label
    getTypeLabel = (reqType: string): string => snakeCaseToTitleCase(reqType.toLowerCase()),
    hasUnsavedChanges = computed(() => localPriorityChanges.value.size > 0),
    priorityStats = computed(() => {
        const stats = {
            [MoscowPriority.MUST]: 0,
            [MoscowPriority.SHOULD]: 0,
            [MoscowPriority.COULD]: 0,
            [MoscowPriority.WONT]: 0,
            unset: 0
        }

        allRequirements.value.forEach((req) => {
            const effectivePriority = getEffectivePriority(req)
            if (effectivePriority)
                stats[effectivePriority]++
            else
                stats.unset++
        })

        return stats
    }),
    clearChanges = () => {
        localPriorityChanges.value.clear()
    },
    saveChanges = async () => {
        if (localPriorityChanges.value.size === 0) return

        // For Active requirements, show confirmation about creating new Proposed versions
        if (selectedWorkflowState.value === WorkflowState.Active) {
            const confirmed = confirm(
                'Priority changes to Active requirements will create new Proposed versions that require review and approval. '
                + 'The original Active requirements will remain unchanged. Continue?'
            )
            if (!confirmed) return
        }

        const updates = Array.from(localPriorityChanges.value.entries()).map(([id, priority]) => {
            const requirement = allRequirements.value.find(req => req.id === id)
            if (!requirement) return null

            const reqTypeSlug = requirement.reqType.toLowerCase().replace('_', '-')

            return {
                id,
                reqType: requirement.reqType,
                priority,
                workflowState: requirement.workflowState,
                reqTypeSlug
            }
        }).filter(Boolean)

        try {
            // Update priorities via proper workflow endpoints
            await Promise.all(updates.map(async (update) => {
                if (!update) return

                let endpoint: string

                if (update.workflowState === WorkflowState.Proposed) {
                    // For Proposed requirements, edit directly
                    endpoint = `/api/requirements/${update.reqTypeSlug}/proposed/${update.id}/edit`
                } else if (update.workflowState === WorkflowState.Active) {
                    // For Active requirements, create a revision (new version in Proposed state)
                    endpoint = `/api/requirements/${update.reqTypeSlug}/active/${update.id}/edit`
                } else {
                    // If this section is ever reached we have a problem
                    toast.add({
                        icon: 'i-lucide-alert-circle',
                        title: 'Error',
                        description: `Unexpected workflow state: ${update.workflowState}`,
                        color: 'error'
                    })
                    return
                }

                await $fetch(endpoint, {
                    method: 'POST',
                    body: { priority: update.priority === null ? undefined : update.priority }
                })
            }))

            localPriorityChanges.value.clear()
            await refresh()

            // Show appropriate success message based on workflow state
            if (selectedWorkflowState.value === WorkflowState.Active) {
                toast.add({
                    icon: 'i-lucide-check',
                    title: 'Priority changes saved',
                    description: 'New Proposed versions created that require review and approval.'
                })
            } else {
                toast.add({
                    icon: 'i-lucide-check',
                    title: 'Success',
                    description: 'Priority changes saved successfully.'
                })
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            toast.add({
                icon: 'i-lucide-alert-circle',
                title: 'Error',
                description: `Failed to save priority changes: ${message}`,
                color: 'error'
            })
        }
    },
    draggedRequirement = ref<BehaviorType | ScenarioType | null>(null),
    dragOverTarget = ref<string | null>(null),

    // Drag and drop handlers
    onDragStart = (event: DragEvent, requirement: BehaviorType | ScenarioType) => {
        if (!event.dataTransfer) return

        draggedRequirement.value = requirement
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', requirement.id)

        // Add visual feedback to the dragged element
        if (event.target instanceof HTMLElement)
            event.target.style.opacity = '0.5'
    },
    onDragEnd = (event: DragEvent) => {
        // Reset visual state
        if (event.target instanceof HTMLElement)
            event.target.style.opacity = ''

        draggedRequirement.value = null
        dragOverTarget.value = null
    },
    onDragOver = (event: DragEvent, targetPriority: MoscowPriority | 'unset') => {
        event.preventDefault()
        event.dataTransfer!.dropEffect = 'move'
        dragOverTarget.value = targetPriority.toString()
    },
    onDragLeave = () => {
        dragOverTarget.value = null
    },
    onDrop = (event: DragEvent, targetPriority: MoscowPriority | 'unset') => {
        event.preventDefault()

        const requirement = draggedRequirement.value
        if (!requirement) return

        // Update the local priority
        if (targetPriority === 'unset') {
            // If the requirement originally had a priority, we need to explicitly set it to null
            // If it didn't have a priority originally, we can just remove any local changes
            if (requirement.priority)
                localPriorityChanges.value.set(requirement.id, null)
            else
                localPriorityChanges.value.delete(requirement.id)
        } else
            localPriorityChanges.value.set(requirement.id, targetPriority)

        // Reset drag state
        draggedRequirement.value = null
        dragOverTarget.value = null
    }
</script>

<template>
    <div class="space-y-6">
        <div>
            <h1 class="text-3xl font-bold">
                System Prioritization
            </h1>
            <p class="text-muted mt-2">
                Classify behaviors and scenarios by degree of criticality using the MoSCoW method.
            </p>
            <p class="text-sm text-muted mt-1">
                Drag requirements from the backlog to the appropriate priority column to organize them.
                Includes behaviors (Functional, Non-Functional) and scenarios (User Stories, Use Cases, Test Cases).
            </p>
            <p class="text-xs text-muted mt-1">
                <strong>Note:</strong> Priority changes to Active requirements create new Proposed versions that require review.
            </p>
        </div>

        <!-- Workflow State Filter -->
        <UCard>
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-lg font-medium mb-1">
                        View Filter
                    </h3>
                    <p class="text-sm text-muted">
                        Choose which requirements to display and prioritize
                    </p>
                </div>
                <USelectMenu
                    v-model="selectedWorkflowState"
                    :items="workflowStateOptions"
                    value-key="value"
                    class="w-48"
                />
            </div>
        </UCard>

        <!-- Priority Statistics -->
        <UCard v-if="allRequirements.length > 0">
            <template #header>
                <div class="flex items-center justify-between">
                    <h2 class="text-xl font-semibold">
                        Priority Distribution
                    </h2>
                    <div
                        v-if="hasUnsavedChanges"
                        class="flex items-center gap-2"
                    >
                        <UButton
                            label="Save Changes"
                            color="primary"
                            size="sm"
                            @click="saveChanges"
                        />
                        <UButton
                            label="Clear Changes"
                            color="error"
                            size="sm"
                            @click="clearChanges"
                        />
                    </div>
                </div>
            </template>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div
                    v-for="option in priorityOptions"
                    :key="option.value"
                    class="text-center"
                >
                    <div class="text-2xl font-bold">
                        {{ priorityStats[option.value] }}
                    </div>
                    <UBadge
                        :label="option.label"
                        :color="option.color"
                        size="sm"
                    />
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold">
                        {{ priorityStats.unset }}
                    </div>
                    <UBadge
                        label="Unset"
                        color="neutral"
                        size="sm"
                    />
                </div>
            </div>
        </UCard>

        <!-- Loading State -->
        <div
            v-if="isLoading"
            class="flex items-center justify-center min-h-96"
        >
            <div class="text-center">
                <UIcon
                    name="i-lucide-loader-2"
                    class="w-8 h-8 animate-spin text-muted mx-auto mb-2"
                />
                <p class="text-muted">
                    Loading requirements...
                </p>
            </div>
        </div>

        <!-- Backlog + Matrix Layout -->
        <div
            v-else-if="allRequirements && allRequirements.length > 0"
            class="grid grid-cols-12 gap-6 h-[calc(100vh-25rem)] min-h-[600px]"
        >
            <!-- Backlog Section -->
            <div class="col-span-12 lg:col-span-3">
                <UCard
                    :class="[
                        'h-full transition-colors border-2 border-dashed',
                        dragOverTarget === 'unset' ? 'border-primary-400 bg-primary-50 dark:bg-primary-950/20' : 'border-default'
                    ]"
                    @dragover="onDragOver($event, 'unset')"
                    @dragleave="onDragLeave"
                    @drop="onDrop($event, 'unset')"
                >
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon
                                name="i-lucide-inbox"
                                class="w-5 h-5"
                            />
                            <h3 class="text-lg font-semibold">
                                Backlog
                            </h3>
                            <UBadge
                                :label="requirementsByPriority.unset.length.toString()"
                                color="neutral"
                                size="sm"
                            />
                        </div>
                    </template>

                    <div class="space-y-2 overflow-y-auto max-h-[calc(100vh-31.25rem)] min-h-[300px] priority-scrollable">
                        <div
                            v-for="requirement in requirementsByPriority.unset"
                            :key="requirement.id"
                            class="p-3 border rounded-lg hover:shadow-sm cursor-move transition-all"
                            draggable="true"
                            @dragstart="onDragStart($event, requirement)"
                            @dragend="onDragEnd"
                        >
                            <div class="flex items-start justify-between gap-2">
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 mb-1">
                                        <UBadge
                                            :label="getTypeLabel(requirement.reqType)"
                                            color="neutral"
                                            variant="soft"
                                            size="sm"
                                        />
                                        <UBadge
                                            v-if="requirement.reqId"
                                            :label="requirement.reqId"
                                            color="neutral"
                                            variant="outline"
                                            size="sm"
                                        />
                                    </div>
                                    <h4 class="font-medium text-sm leading-tight mb-1">
                                        {{ requirement.name }}
                                    </h4>
                                    <p
                                        v-if="requirement.description"
                                        class="text-xs text-muted line-clamp-2"
                                    >
                                        {{ requirement.description }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            v-if="requirementsByPriority.unset.length === 0"
                            class="text-center py-8 text-muted"
                        >
                            <UIcon
                                name="i-lucide-check-circle"
                                class="w-8 h-8 mx-auto mb-2"
                            />
                            <p class="text-sm">
                                All requirements prioritized!
                            </p>
                        </div>
                    </div>
                </UCard>
            </div>

            <!-- Matrix Section -->
            <div class="col-span-12 lg:col-span-9">
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-full">
                    <div
                        v-for="option in priorityOptions"
                        :key="option.value"
                        class="flex flex-col h-full"
                    >
                        <UCard
                            :class="[
                                'flex-1 min-h-0',
                                option.bgClass,
                                option.borderClass,
                                'border-2 border-dashed transition-colors',
                                dragOverTarget === option.value ? 'border-primary-400 bg-primary-50 dark:bg-primary-950/20' : ''
                            ]"
                            @dragover="onDragOver($event, option.value)"
                            @dragleave="onDragLeave"
                            @drop="onDrop($event, option.value)"
                        >
                            <template #header>
                                <div class="text-center">
                                    <UBadge
                                        :label="option.label"
                                        :color="option.color"
                                        class="mb-2"
                                    />
                                    <p class="text-xs text-muted">
                                        {{ option.description }}
                                    </p>
                                    <div class="text-lg font-bold mt-1">
                                        {{ requirementsByPriority[option.value].length }}
                                    </div>
                                </div>
                            </template>

                            <div class="space-y-2 overflow-y-auto flex-1 max-h-[calc(100vh-31.25rem)] min-h-[300px] priority-scrollable">
                                <div
                                    v-for="requirement in requirementsByPriority[option.value]"
                                    :key="requirement.id"
                                    class="p-2 bg-default dark:bg-elevated border border-default rounded-lg hover:shadow-sm cursor-move transition-all text-sm"
                                    draggable="true"
                                    @dragstart="onDragStart($event, requirement)"
                                    @dragend="onDragEnd"
                                >
                                    <div class="flex items-start justify-between gap-1">
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center gap-1 mb-1">
                                                <UBadge
                                                    :label="getTypeLabel(requirement.reqType)"
                                                    color="neutral"
                                                    variant="soft"
                                                    size="sm"
                                                />
                                                <UBadge
                                                    v-if="requirement.reqId"
                                                    :label="requirement.reqId"
                                                    color="neutral"
                                                    variant="outline"
                                                    size="sm"
                                                />
                                                <UBadge
                                                    v-if="localPriorityChanges.has(requirement.id)"
                                                    label="Modified"
                                                    color="warning"
                                                    size="sm"
                                                />
                                            </div>
                                            <h4 class="font-medium text-xs leading-tight mb-1">
                                                {{ requirement.name }}
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </UCard>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <UCard v-else>
            <div class="text-center py-12">
                <UIcon
                    name="i-lucide-arrow-up-down"
                    class="w-12 h-12 text-muted mx-auto mb-4"
                />
                <h3 class="text-lg font-medium mb-2">
                    No Requirements Found
                </h3>
                <p class="text-muted">
                    No behaviors or scenarios are available to prioritize at this time.
                    Requirements must be created in other sections before they can be categorized here.
                </p>
            </div>
        </UCard>
    </div>
</template>
