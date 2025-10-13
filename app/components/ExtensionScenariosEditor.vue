<script setup lang="ts">
import { useStepHierarchy } from '~/composables/useStepHierarchy'
import type { BaseStep } from '~/composables/useStepHierarchy'
import { useStepRefs } from '~/composables/useStepRefs'
import { ScenarioStepTypeEnum } from '#shared/domain'
import { ScenarioStepReference, type ScenarioStepReferenceType } from '#shared/domain/requirements/EntityReferences'

interface ExtensionStep extends BaseStep {
    description: string
    extensionGroupKey: string
}

interface NestedExtensionStep extends ExtensionStep {
    children: NestedExtensionStep[]
}

const props = defineProps<{
        modelValue?: ScenarioStepReferenceType[]
        disabled?: boolean
    }>(),
    emit = defineEmits<{
        'update:modelValue': [value: ScenarioStepReferenceType[]]
        'validation-ready': [validateFn: () => Promise<{ isValid: boolean, message?: string }>]
    }>(),
    { buildHierarchy, indentStep, outdentStep, addStepAfter, getNextSiblingOrder, removeStepAndDescendants } = useStepHierarchy<ExtensionStep>(),
    { setStepRef, focusStep } = useStepRefs()

interface ExtensionGroupData {
    title: string
    steps: ExtensionStep[]
}

const extensionGroupsMap = ref<Map<string, ExtensionGroupData>>(new Map()),
    isInternalUpdate = ref(false),

    // Computed view: fold the Map into display format
    extensionGroups = computed(() =>
        Array.from(extensionGroupsMap.value.entries())
            .map(([groupKey, data]) => ({
                groupKey,
                title: data.title,
                // eslint-disable-next-line max-params
                allSteps: data.steps.sort((a, b) => a.order - b.order),
                // eslint-disable-next-line max-params
                rootSteps: buildExtensionHierarchy(data.steps.sort((a, b) => a.order - b.order))
            }))
            // eslint-disable-next-line max-params
            .sort((a, b) => a.groupKey.localeCompare(b.groupKey))
    ),
    // Flattened steps view for emission
    allExtensionSteps = computed(() =>
        Array.from(extensionGroupsMap.value.values())
            .flatMap(group => group.steps)
    )

function buildExtensionHierarchy(steps: ExtensionStep[]): NestedExtensionStep[] {
    return buildHierarchy(steps) as NestedExtensionStep[]
}

// Initialize from modelValue - but only if it's not an internal update
watch(() => props.modelValue, (newSteps: ScenarioStepReferenceType[] | undefined) => {
    if (!isInternalUpdate.value) {
        if (newSteps && newSteps.length > 0)
            initializeExtensionsFromProp(newSteps)
        else
            extensionGroupsMap.value.clear()
    }
    isInternalUpdate.value = false
}, { immediate: true })

function initializeExtensionsFromProp(steps: ScenarioStepReferenceType[]) {
    // Smart Data: Fold steps into grouped Map structure
    const groupsData = steps
        .filter(step => step.name && (
            step.name.match(/^Extension [A-Z]/)
            || step.name.match(/^Extension \d+[a-z]/)
            || step.name.toLowerCase().includes('extension')
        ))
        // eslint-disable-next-line max-params
        .reduce((acc, step) => {
            // Extract extension key from name or default to 'A'
            let groupKey = 'A'
            const nameMatch = step.name?.match(/Extension ([A-Z]|\d+[a-z])/)
            if (nameMatch) groupKey = nameMatch[1] || 'A'

            if (!acc.has(groupKey))
                acc.set(groupKey, { title: '', steps: [] })

            acc.get(groupKey)!.steps.push({
                id: step.id,
                description: step.name || '',
                parentStepId: step.parentStepId,
                order: step.order,
                extensionGroupKey: groupKey
            })

            return acc
        }, new Map<string, ExtensionGroupData>())

    extensionGroupsMap.value = groupsData
}

function removeStep(stepId: string) {
    // Smart operation: update each group's steps and trigger reactivity
    // eslint-disable-next-line max-params
    extensionGroupsMap.value.forEach((groupData, groupKey) => {
        const originalLength = groupData.steps.length
        groupData.steps = removeStepAndDescendants({ steps: groupData.steps, stepId })

        // Trigger reactivity if steps were removed
        if (groupData.steps.length !== originalLength)
            extensionGroupsMap.value.set(groupKey, { ...groupData })
    })
    emitExtensions()
}

function handleExtensionKeydown({ event, step }: { event: KeyboardEvent, step: ExtensionStep }) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        addExtensionStepAfter(step)
    } else if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault()
        indentExtensionStep(step)
    } else if (event.key === 'Tab' && event.shiftKey) {
        event.preventDefault()
        outdentExtensionStep(step)
    }
}

function handleExtensionHeaderKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        // Create a new extension group (B, C, etc.) instead of adding a step to current group
        addNewExtensionGroup()
    }
}

function removeExtensionGroup(groupKey: string) {
    // Smart Data: Simply delete from Map
    extensionGroupsMap.value.delete(groupKey)
    emitExtensions()
}

function indentExtensionStep(step: ExtensionStep) {
    const groupData = extensionGroupsMap.value.get(step.extensionGroupKey)!,
        success = indentStep({ steps: groupData.steps, stepId: step.id })
    if (success) {
        // Trigger reactivity by reassigning the map entry
        extensionGroupsMap.value.set(step.extensionGroupKey, { ...groupData })
        emitExtensions()

        // Restore focus after DOM updates
        nextTick(() => {
            focusStep(`ext-${step.extensionGroupKey}-${step.id}`)
        })
    }
}

function outdentExtensionStep(step: ExtensionStep) {
    const groupData = extensionGroupsMap.value.get(step.extensionGroupKey)!,
        success = outdentStep({ steps: groupData.steps, stepId: step.id })
    if (success) {
        // Trigger reactivity by reassigning the map entry
        extensionGroupsMap.value.set(step.extensionGroupKey, { ...groupData })
        emitExtensions()

        // Restore focus after DOM updates
        nextTick(() => {
            focusStep(`ext-${step.extensionGroupKey}-${step.id}`)
        })
    }
}

function addExtensionStep(groupKey: string) {
    const groupData = extensionGroupsMap.value.get(groupKey)!,
        nextOrder = getNextSiblingOrder({ steps: groupData.steps, parentStepId: undefined }),

        newStep: ExtensionStep = {
            id: crypto.randomUUID(),
            description: '',
            parentStepId: undefined,
            order: nextOrder,
            extensionGroupKey: groupKey
        }

    groupData.steps.push(newStep)

    // Trigger reactivity by reassigning the map entry
    extensionGroupsMap.value.set(groupKey, { ...groupData })

    nextTick(() => {
        focusStep(`ext-${groupKey}-${newStep.id}`)
    })

    emitExtensions()
}

function addExtensionStepAfter(currentStep: ExtensionStep) {
    const groupData = extensionGroupsMap.value.get(currentStep.extensionGroupKey)!,
        newStep = addStepAfter({
            steps: groupData.steps,
            targetStepId: currentStep.id,
            newStepFactory: ({ order, parentStepId }) => ({
                id: crypto.randomUUID(),
                description: '',
                parentStepId,
                order,
                extensionGroupKey: currentStep.extensionGroupKey
            })
        })

    if (newStep) {
        // Trigger reactivity by reassigning the map entry
        extensionGroupsMap.value.set(currentStep.extensionGroupKey, { ...groupData })

        nextTick(() => {
            focusStep(`ext-${currentStep.extensionGroupKey}-${newStep.id}`)
        })

        emitExtensions()
    }
}

function addNewExtensionGroup() {
    // Find next available letter using fold
    const existingKeys = new Set(extensionGroupsMap.value.keys()),
        nextKey = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            .split('')
            .find(letter => !existingKeys.has(letter)) || 'A'

    // Smart Data: Add new group to Map
    extensionGroupsMap.value.set(nextKey, { title: '', steps: [] })

    // Focus on the extension title input for the new group
    nextTick(() => {
        focusStep(`ext-header-${nextKey}`)
    })
}

function addExtensionGroupForStep({ stepNumber, title = '' }: { stepNumber: string, title: string }) {
    // Create an extension group with a specific key pattern like "3a" for step 3
    const extensionKey = `${stepNumber}a`

    // Check if this extension already exists
    if (extensionGroupsMap.value.has(extensionKey)) {
        // Focus on existing extension
        nextTick(() => {
            focusStep(`ext-header-${extensionKey}`)
        })
        return
    }

    // Add new extension group with the specific key
    extensionGroupsMap.value.set(extensionKey, { title, steps: [] })

    // Focus on the extension title input for the new group
    nextTick(() => {
        focusStep(`ext-header-${extensionKey}`)
    })
}

// Expose method for parent component
defineExpose({
    addExtensionGroupForStep
})

function handleStepUpdate() {
    nextTick(() => {
        isInternalUpdate.value = true
        emitExtensions()
    })
}

function handleStepDescriptionUpdate({ stepId, description }: { stepId: string, description: string }) {
    // Find the step in the extension groups and update its description
    for (const [groupKey, groupData] of extensionGroupsMap.value) {
        const findAndUpdateStep = (steps: (ExtensionStep & { children?: ExtensionStep[] })[]): boolean => {
            for (const step of steps) {
                if (step.id === stepId) {
                    step.description = description
                    return true
                }
                if (step.children && findAndUpdateStep(step.children))
                    return true
            }
            return false
        }

        if (findAndUpdateStep(groupData.steps)) {
            // Trigger reactivity by reassigning the map entry
            extensionGroupsMap.value.set(groupKey, { ...groupData })
            emitExtensions()
            break
        }
    }
}

function emitExtensions() {
    // Fold all steps from Map into emission format
    const extensionRefs: ScenarioStepReferenceType[] = allExtensionSteps.value.map(step =>
        ScenarioStepReference.parse({
            id: step.id,
            name: step.description,
            parentStepId: step.parentStepId,
            order: step.order,
            stepType: ScenarioStepTypeEnum.Action
        })
    )

    isInternalUpdate.value = true
    emit('update:modelValue', extensionRefs)
}

// Validation
const validateExtensions = async (): Promise<{ isValid: boolean, message?: string }> => {
    // Extensions are optional, so no validation errors
    return { isValid: true }
}

onMounted(() => {
    emit('validation-ready', validateExtensions)
})
</script>

<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <h4 class="text-sm font-semibold text-highlighted">
                Extensions:
            </h4>
            <UButton
                size="xs"
                color="primary"
                variant="ghost"
                icon="i-lucide-plus"
                :disabled="disabled"
                @click="addNewExtensionGroup"
            >
                Add Extension
            </UButton>
        </div>

        <div
            v-if="extensionGroups.length > 0"
            class="space-y-4"
        >
            <div
                v-for="group in extensionGroups"
                :key="group.groupKey"
                class="extension-group"
            >
                <div class="extension-header">
                    <strong class="extension-label">{{ group.groupKey }}.</strong>
                    <UInput
                        :ref="el => setStepRef({ key: `ext-header-${group.groupKey}`, el })"
                        v-model="extensionGroupsMap.get(group.groupKey)!.title"
                        placeholder="Enter extension scenario..."
                        :disabled="disabled"
                        class="extension-title-input"
                        @keydown="handleExtensionHeaderKeydown"
                    />
                    <span class="extension-colon">:</span>
                    <UButton
                        size="xs"
                        color="neutral"
                        variant="ghost"
                        icon="i-lucide-plus"
                        :disabled="disabled"
                        @click="addExtensionStep(group.groupKey)"
                    >
                        Add Step
                    </UButton>
                    <UButton
                        size="xs"
                        color="error"
                        variant="ghost"
                        icon="i-lucide-trash-2"
                        :disabled="disabled"
                        title="Delete extension group"
                        @click="removeExtensionGroup(group.groupKey)"
                    />
                </div>

                <ol class="extension-list">
                    <ExtensionStepItem
                        v-for="step in group.rootSteps"
                        :key="step.id"
                        :step="step"
                        :group-key="group.groupKey"
                        :disabled="disabled"
                        @step-update="handleStepUpdate"
                        @step-keydown="(event, step) => handleExtensionKeydown({ event, step })"
                        @remove-step="removeStep"
                        @set-step-ref="(key, el) => setStepRef({ key, el })"
                        @update-step-description="handleStepDescriptionUpdate({ stepId: step.id, description: step.description })"
                    />
                </ol>
            </div>
        </div>

        <!-- Empty state for extensions -->
        <div
            v-if="extensionGroups.length === 0"
            class="text-center py-4"
        >
            <p class="text-sm text-muted mb-2">
                No extensions defined
            </p>
            <p class="text-xs text-muted">
                Extensions provide alternative flows for the use case
            </p>
        </div>

        <!-- Debug info -->
        <div class="text-xs text-muted">
            Extension groups: {{ extensionGroups.length }}
        </div>
    </div>
</template>

<style scoped>
/* Extension styling */
.extension-group {
    margin-left: 1rem;
    margin-bottom: 1.5rem;
    background: var(--ui-bg-muted);
    padding: 1rem;
    border-radius: 0.5rem;
}

.extension-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
}

.extension-label {
    font-weight: 600;
    color: var(--ui-primary);
    min-width: 2rem;
}

.extension-title-input {
    flex: 1;
    max-width: 300px;
}

.extension-colon {
    color: var(--ui-text);
    font-weight: 600;
}

.extension-list {
    counter-reset: extension;
    padding-left: 0;
    list-style: none;
}

/* Dark mode support */
.dark .extension-group {
    background: var(--ui-bg-elevated);
}
</style>
