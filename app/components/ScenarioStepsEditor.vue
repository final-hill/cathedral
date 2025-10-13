<template>
    <div class="space-y-6">
        <MainSuccessScenarioEditor
            v-model="internalMainSteps"
            :disabled="disabled"
            @validation-ready="handleMainValidationReady"
            @add-extension-for-step="(stepId, stepNumber) => handleAddExtensionForStep({ stepId, stepNumber })"
        />

        <ExtensionScenariosEditor
            ref="extensionEditor"
            v-model="internalExtensionSteps"
            :disabled="disabled"
            @validation-ready="handleExtensionsValidationReady"
        />
    </div>
</template>

<script setup lang="ts">
import type { ScenarioStepReferenceType } from '#shared/domain/requirements/EntityReferences'
import MainSuccessScenarioEditor from './MainSuccessScenarioEditor.vue'
import ExtensionScenariosEditor from './ExtensionScenariosEditor.vue'

const props = defineProps<{
        mainSteps?: ScenarioStepReferenceType[]
        extensions?: ScenarioStepReferenceType[]
        label: string
        disabled?: boolean
    }>(),
    emit = defineEmits<{
        'update:mainSteps': [value: ScenarioStepReferenceType[]]
        'update:extensions': [value: ScenarioStepReferenceType[]]
        'validation-ready': [validateFn: () => Promise<{ isValid: boolean, message?: string }>]
    }>(),
    extensionEditor = ref<InstanceType<typeof ExtensionScenariosEditor> | null>(null),
    internalMainSteps = ref<ScenarioStepReferenceType[]>([]),
    internalExtensionSteps = ref<ScenarioStepReferenceType[]>([]),
    mainValidationFn = ref<(() => Promise<{ isValid: boolean, message?: string }>) | null>(null),
    extensionsValidationFn = ref<(() => Promise<{ isValid: boolean, message?: string }>) | null>(null)

watch(() => props.mainSteps, (newValue) => {
    if (newValue)
        internalMainSteps.value = [...newValue]
}, { immediate: true })

watch(() => props.extensions, (newValue) => {
    if (newValue)
        internalExtensionSteps.value = [...newValue]
}, { immediate: true })

// Watch for internal changes and emit separate updates
watch(internalMainSteps, (newMainSteps) => {
    emit('update:mainSteps', [...newMainSteps])
}, { deep: true })

watch(internalExtensionSteps, (newExtensionSteps) => {
    emit('update:extensions', [...newExtensionSteps])
}, { deep: true })

function handleMainValidationReady(validateFn: () => Promise<{ isValid: boolean, message?: string }>) {
    mainValidationFn.value = validateFn
}

function handleExtensionsValidationReady(validateFn: () => Promise<{ isValid: boolean, message?: string }>) {
    extensionsValidationFn.value = validateFn
}

function handleAddExtensionForStep({ stepId: _, stepNumber }: { stepId: string, stepNumber: string }) {
    // Create an extension group for this step (e.g., "3a" for step 3)
    if (extensionEditor.value)
        extensionEditor.value.addExtensionGroupForStep({ stepNumber, title: `Extension for step ${stepNumber}` })
}

// Combined validation
const validateAll = async (): Promise<{ isValid: boolean, message?: string }> => {
    const results: { isValid: boolean, message?: string }[] = []

    if (mainValidationFn.value)
        results.push(await mainValidationFn.value())

    if (extensionsValidationFn.value)
        results.push(await extensionsValidationFn.value())

    const failedResult = results.find(r => !r.isValid)
    if (failedResult)
        return failedResult

    return { isValid: true }
}

onMounted(() => {
    emit('validation-ready', validateAll)
})
</script>
