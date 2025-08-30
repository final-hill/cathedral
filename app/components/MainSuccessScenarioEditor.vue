<template>
    <div class="space-y-3">
        <div class="flex items-center justify-between">
            <h4 class="text-sm font-semibold text-highlighted">
                Main Success Scenario:
            </h4>
            <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-plus"
                :disabled="disabled"
                @click="addMainStep"
            >
                Add Step
            </UButton>
        </div>

        <ol class="main-scenario-list">
            <StepItem
                v-for="step in nestedMainSteps"
                :key="step.id"
                :step="step"
                :disabled="disabled"
                @step-update="handleStepUpdate"
                @step-keydown="handleStepKeydown"
                @remove-step="removeStepById"
                @add-extension="handleAddExtension"
                @set-step-ref="setStepRef"
                @update-step-description="handleStepDescriptionUpdate"
            />
        </ol>

        <!-- Debug info -->
        <div class="text-xs text-muted">
            Main steps: {{ mainSteps.length }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { useStepHierarchy } from '~/composables/useStepHierarchy'
import type { BaseStep } from '~/composables/useStepHierarchy'
import { useStepRefs } from '~/composables/useStepRefs'
import { ReqType, ScenarioStepTypeEnum } from '~~/shared/domain'
import type { ScenarioStepReferenceType } from '~~/shared/domain/requirements/EntityReferences'

interface MainStep extends BaseStep {
    description: string
}

interface NestedStep extends MainStep {
    children: NestedStep[]
}

const props = defineProps<{
    modelValue?: ScenarioStepReferenceType[]
    disabled?: boolean
}>(),

    emit = defineEmits<{
        'update:modelValue': [value: ScenarioStepReferenceType[]]
        'validation-ready': [validateFn: () => Promise<{ isValid: boolean, message?: string }>]
        'add-extension-for-step': [stepId: string, stepNumber: string]
    }>(),
    { buildHierarchy, indentStep, outdentStep, addStepAfter, removeStepAndDescendants, getNextSiblingOrder } = useStepHierarchy<MainStep>(),
    { setStepRef, focusStep } = useStepRefs(),
    mainSteps = ref<MainStep[]>([]),
    nestedMainSteps = computed(() => buildHierarchy(mainSteps.value) as NestedStep[]),
    validationState = computed(() => {
        const emptySteps = mainSteps.value.filter(step => !step.description.trim())
        return emptySteps.length > 0
            ? { isValid: false, message: 'Please provide descriptions for all main scenario steps.' }
            : { isValid: true }
    })

watch(() => props.modelValue, (newSteps: ScenarioStepReferenceType[] | undefined) => {
    if (newSteps && newSteps.length > 0)
        initializeMainStepsFromProp(newSteps)
    else
        mainSteps.value = []
}, { immediate: true })

function initializeMainStepsFromProp(steps: ScenarioStepReferenceType[]) {
    mainSteps.value = steps.map(step => ({
        id: step.id,
        description: step.name || '',
        parentStepId: step.parentStepId,
        order: step.order
    }))
}

function removeStepById(stepId: string) {
    mainSteps.value = removeStepAndDescendants(mainSteps.value, stepId)
    emitMainSteps()
}

function handleStepKeydown(event: KeyboardEvent, step: NestedStep) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        addMainStepAfter(step.id)
    } else if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault()
        indentMainStepById(step.id)
    } else if (event.key === 'Tab' && event.shiftKey) {
        event.preventDefault()
        outdentMainStepById(step.id)
    }
}

function addMainStep() {
    const nextOrder = getNextSiblingOrder(mainSteps.value, undefined),
        newStep: MainStep = {
            id: crypto.randomUUID(),
            description: '',
            parentStepId: undefined,
            order: nextOrder
        }

    mainSteps.value.push(newStep)

    nextTick(() => {
        focusStep(`main-step-${newStep.id}`)
    })

    emitMainSteps()
}

function indentMainStepById(stepId: string) {
    const success = indentStep(mainSteps.value, stepId)
    if (success) {
        emitMainSteps()
        nextTick(() => {
            focusStep(`main-step-${stepId}`)
        })
    }
}

function outdentMainStepById(stepId: string) {
    const success = outdentStep(mainSteps.value, stepId)
    if (success) {
        emitMainSteps()
        nextTick(() => {
            focusStep(`main-step-${stepId}`)
        })
    }
}

function addMainStepAfter(stepId: string) {
    const newId = crypto.randomUUID(),
        newStepFactory = (order: number, parentStepId?: string): MainStep => ({
            id: newId,
            description: '',
            parentStepId,
            order
        }),
        newStep = addStepAfter(mainSteps.value, stepId, newStepFactory)

    if (newStep) {
        nextTick(() => {
            focusStep(`main-step-${newStep.id}`)
        })
        emitMainSteps()
    }
}

function handleStepUpdate() {
    // Use nextTick to ensure DOM updates are complete before emitting
    nextTick(() => {
        emitMainSteps()
    })
}

function handleStepDescriptionUpdate(stepId: string, description: string) {
    // Find and update the step description
    const step = mainSteps.value.find(s => s.id === stepId)
    if (step)
        step.description = description
}

function emitMainSteps() {
    const mainStepRefs: ScenarioStepReferenceType[] = mainSteps.value.map(step => ({
        id: step.id,
        name: step.description,
        reqType: ReqType.SCENARIO_STEP,
        stepType: ScenarioStepTypeEnum.Action,
        parentStepId: step.parentStepId,
        order: step.order
    }))

    emit('update:modelValue', mainStepRefs)
}

function handleAddExtension(stepId: string) {
    // Calculate the visual step number for the extension
    const stepNumber = calculateStepNumber(stepId)
    if (stepNumber)
        emit('add-extension-for-step', stepId, stepNumber)
}

function calculateStepNumber(stepId: string): string | null {
    // Build a flat list of steps in display order to calculate visual numbers
    const flatSteps = flattenStepsInDisplayOrder(nestedMainSteps.value),
        stepIndex = flatSteps.findIndex(step => step.id === stepId)

    if (stepIndex === -1) return null

    // Calculate the hierarchical number (like "3" or "3.2")
    return calculateHierarchicalNumber(stepId, nestedMainSteps.value)
}

function flattenStepsInDisplayOrder(steps: NestedStep[]): NestedStep[] {
    const flattened: NestedStep[] = []
    for (const step of steps) {
        flattened.push(step)
        if (step.children.length > 0)
            flattened.push(...flattenStepsInDisplayOrder(step.children))
    }
    return flattened
}

function calculateHierarchicalNumber(stepId: string, steps: NestedStep[], prefix: string = ''): string | null {
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i]!,
            currentNumber = prefix ? `${prefix}.${i + 1}` : `${i + 1}`

        if (step.id === stepId)
            return currentNumber

        if (step.children.length > 0) {
            const childResult = calculateHierarchicalNumber(stepId, step.children, currentNumber)
            if (childResult) return childResult
        }
    }
    return null
}

// Use computed validation instead of function
const validateScenarioSteps = async (): Promise<{ isValid: boolean, message?: string }> => {
    return validationState.value
}

onMounted(() => {
    emit('validation-ready', validateScenarioSteps)
})
</script>

<style scoped>
.main-scenario-list {
  counter-reset: section;
  padding-left: 0;
  list-style: none;
}
</style>
