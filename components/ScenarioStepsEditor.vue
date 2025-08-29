<template>
    <div class="space-y-6">
        <MainSuccessScenarioEditor
            v-model="mainSteps"
            :disabled="disabled"
            @validation-ready="handleMainValidationReady"
            @add-extension-for-step="handleAddExtensionForStep"
        />

        <ExtensionScenariosEditor
            ref="extensionEditor"
            v-model="extensionSteps"
            :disabled="disabled"
            @validation-ready="handleExtensionsValidationReady"
        />
    </div>
</template>

<script setup lang="ts">
import type { ScenarioStepReferenceType } from '~/shared/domain/requirements/EntityReferences'
import MainSuccessScenarioEditor from './MainSuccessScenarioEditor.vue'
import ExtensionScenariosEditor from './ExtensionScenariosEditor.vue'

const props = defineProps<{
    modelValue?: ScenarioStepReferenceType[]
    label: string
    disabled?: boolean
}>(),
    emit = defineEmits<{
        'update:modelValue': [value: ScenarioStepReferenceType[]]
        'validation-ready': [validateFn: () => Promise<{ isValid: boolean, message?: string }>]
    }>(),
    extensionEditor = ref<InstanceType<typeof ExtensionScenariosEditor> | null>(null),
    mainSteps = ref<ScenarioStepReferenceType[]>([]),
    extensionSteps = ref<ScenarioStepReferenceType[]>([]),
    mainValidationFn = ref<(() => Promise<{ isValid: boolean, message?: string }>) | null>(null),
    extensionsValidationFn = ref<(() => Promise<{ isValid: boolean, message?: string }>) | null>(null),
    isInternalUpdate = ref(false)

// Watch for prop changes and split them into main and extension steps
watch(() => props.modelValue, (newValue) => {
    if (isInternalUpdate.value) {
        isInternalUpdate.value = false
        return
    }

    if (!newValue) return

    const main = newValue.filter(step => !step.parentStepId),
        extensions = newValue.filter(step => step.parentStepId)

    mainSteps.value = main
    extensionSteps.value = extensions
}, { immediate: true })

// Watch for internal changes and emit combined updates
watch([mainSteps, extensionSteps], () => {
    isInternalUpdate.value = true
    const combined = [...mainSteps.value, ...extensionSteps.value]
    emit('update:modelValue', combined)
}, { deep: true })

function handleMainValidationReady(validateFn: () => Promise<{ isValid: boolean, message?: string }>) {
    mainValidationFn.value = validateFn
}

function handleExtensionsValidationReady(validateFn: () => Promise<{ isValid: boolean, message?: string }>) {
    extensionsValidationFn.value = validateFn
}

function handleAddExtensionForStep(stepId: string, stepNumber: string) {
    // Create an extension group for this step (e.g., "3a" for step 3)
    if (extensionEditor.value)
        extensionEditor.value.addExtensionGroupForStep(stepNumber, `Extension for step ${stepNumber}`)
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
