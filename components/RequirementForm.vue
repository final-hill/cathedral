<script lang="ts" setup>
import type * as req from '#shared/domain/requirements'
import type { FormSchema } from '~/components/XForm.vue'
import { WorkflowState } from '#shared/domain/requirements/enums'
import { ReqType } from '#shared/domain/requirements/ReqType'
import type { ScenarioStepReferenceType } from '~/shared/domain/requirements/EntityReferences'
import ScenarioStepsEditor from '~/components/ScenarioStepsEditor.vue'

const props = defineProps<{
    requirement?: req.RequirementType | null
    schema: FormSchema
    reqType: string
    organizationSlug: string
    solutionSlug: string
    isEdit?: boolean
    loading?: boolean
}>(),
    emit = defineEmits<{
        saved: [requirement: Record<string, unknown>] // Allow any requirement type since we pass through what the API returns
        cancelled: []
    }>(),
    { requirement, schema, reqType, organizationSlug, solutionSlug, isEdit, loading = false } = toRefs(props),
    isEditValue = computed(() => isEdit?.value ?? false)

// Validate that the requirement can be edited based on workflow state when in edit mode
if (isEditValue.value && requirement?.value && ![WorkflowState.Proposed, WorkflowState.Active].includes(requirement.value.workflowState)) {
    throw createError({
        statusCode: 403,
        statusMessage: `Cannot edit requirement in ${requirement.value.workflowState} state. Only Proposed and Active requirements can be edited.`
    })
}

const route = useRoute(),
    router = useRouter(),
    toast = useToast(),
    // Check if this is a Use Case requirement
    isUseCase = computed(() => reqType.value === ReqType.USE_CASE),
    // For Use Cases, create a schema without scenario fields
    nonScenarioSchema = computed(() => {
        if (isUseCase.value) {
            return schema.value.omit({
                mainSuccessScenario: true,
                extensions: true
            })
        }
        return schema.value
    }),
    // Derive the current path from the router, removing the ID and action parts
    currentPath = computed(() => {
        const path = route.path
        if (isEditValue.value)
            return path.replace(/\/[^/]+\/edit$/, '')
        else
            return path.replace(/\/new$/, '')
    }),
    formState = ref((() => {
        if (!requirement?.value) return {} as Partial<req.RequirementType>

        // Filter the requirement data to only include fields that are in the schema
        const schemaKeys = Object.keys(schema.value.shape),
            filteredData: Partial<req.RequirementType> = {}

        for (const key of schemaKeys) {
            if (key in requirement.value)
                (filteredData as Record<string, unknown>)[key] = (requirement.value as Record<string, unknown>)[key]
        }

        return filteredData
    })()),
    // Adapter for ScenarioStepsEditor (Use Case only)
    scenarioStepsAdapter = computed({
        get: () => {
            if (!isUseCase.value) return []
            const formData = formState.value as Record<string, unknown>,
                main = (formData.mainSuccessScenario as ScenarioStepReferenceType[]) || [],
                extensions = (formData.extensions as ScenarioStepReferenceType[]) || []
            return [...main, ...extensions]
        },
        set: (combined: ScenarioStepReferenceType[]) => {
            if (!isUseCase.value) return
            const formData = formState.value as Record<string, unknown>
            formData.mainSuccessScenario = combined.filter(step => !step.parentStepId)
            formData.extensions = combined.filter(step => step.parentStepId)
        }
    }),
    isSubmitting = ref(false),
    onSubmit = async (data?: Record<string, unknown>) => {
        isSubmitting.value = true
        try {
            let result: req.RequirementType,
                // For Use Cases, use formState directly (includes scenario data)
                // For other types, use data from XForm
                submitData = isUseCase.value ? formState.value : (data || {})

            // Trim string values in the submit data
            submitData = Object.keys(submitData).reduce((acc, key) => {
                const value = submitData[key as keyof typeof submitData]
                if (typeof value === 'string')
                    acc[key] = value.trim()
                else if (Array.isArray(value)) {
                    // Handle scenario steps array - trim description fields
                    acc[key] = value.map((item) => {
                        if (item && typeof item === 'object' && 'name' in item && typeof item.name === 'string')
                            return { ...item, name: item.name.trim() }

                        return item
                    })
                } else
                    acc[key] = value

                return acc
            }, {} as Record<string, unknown>)

            if (isEditValue.value && requirement?.value?.id) {
                const endpoint = `/api/requirements/${reqType.value}/${requirement.value.workflowState.toLowerCase()}/${requirement.value.id}/edit`
                result = await $fetch(endpoint, {
                    method: 'POST',
                    body: {
                        ...submitData,
                        solutionSlug: solutionSlug.value,
                        organizationSlug: organizationSlug.value
                    }
                })
                result = requirement.value
            } else {
                const newId = await $fetch(`/api/requirements/${reqType.value}/propose`, {
                    method: 'PUT',
                    body: {
                        ...submitData,
                        solutionSlug: solutionSlug.value,
                        organizationSlug: organizationSlug.value
                    }
                }) as string

                result = await $fetch(`/api/requirements/${reqType.value}/${newId}`, {
                    method: 'GET',
                    params: {
                        solutionSlug: solutionSlug.value,
                        organizationSlug: organizationSlug.value
                    }
                })
            }

            toast.add({
                icon: 'i-lucide-check',
                title: 'Success',
                description: `Requirement ${isEditValue.value ? 'updated' : 'created'} successfully`
            })

            emit('saved', result)

            router.push(`${currentPath.value}/${result.id}`)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error)
            toast.add({
                icon: 'i-lucide-alert-circle',
                title: 'Error',
                description: `Error ${isEditValue.value ? 'updating' : 'creating'} requirement: ${message}`,
                color: 'error'
            })
        } finally {
            isSubmitting.value = false
        }
    },
    onCancel = () => {
        emit('cancelled')
        router.back()
    },
    // Wrapper for Use Case submit (no data parameter needed)
    onUseCaseSubmit = () => onSubmit(),
    // Dummy submit handler for XForm in Use Case mode (buttons will be hidden)
    dummySubmit = async () => {
        // Do nothing - buttons are hidden and real submit is handled by our custom button
    }
</script>

<template>
    <div class="requirement-form">
        <!-- Loading State -->
        <div
            v-if="loading"
            class="flex items-center justify-center min-h-96"
        >
            <div class="text-center">
                <UIcon
                    name="i-lucide-loader-2"
                    class="w-8 h-8 animate-spin text-muted mx-auto mb-2"
                />
                <p class="text-muted">
                    Loading requirement...
                </p>
            </div>
        </div>

        <!-- Form Content -->
        <UCard v-else>
            <template #header>
                <div class="flex items-center justify-between">
                    <h1 class="text-2xl font-bold text-highlighted">
                        {{ isEditValue ? 'Edit' : 'New' }} Requirement
                    </h1>
                    <UButton
                        color="neutral"
                        variant="ghost"
                        icon="i-lucide-x"
                        @click="onCancel"
                    />
                </div>
            </template>

            <!-- Use Case gets special treatment -->
            <div
                v-if="isUseCase"
                class="space-y-6"
            >
                <!-- Regular fields via XForm (without scenarios) -->
                <div class="use-case-form">
                    <XForm
                        v-model:state="formState"
                        :schema="nonScenarioSchema"
                        :disabled="isSubmitting"
                        :on-submit="dummySubmit"
                        :on-cancel="onCancel"
                    />
                </div>

                <!-- Scenario fields via custom component -->
                <ScenarioStepsEditor
                    v-model="scenarioStepsAdapter"
                    label="Scenarios"
                    :disabled="isSubmitting"
                />

                <!-- Submit buttons -->
                <div class="flex gap-3 justify-end">
                    <UButton
                        color="neutral"
                        variant="outline"
                        :disabled="isSubmitting"
                        @click="onCancel"
                    >
                        Cancel
                    </UButton>
                    <UButton
                        :loading="isSubmitting"
                        @click="onUseCaseSubmit"
                    >
                        {{ isEditValue ? 'Update' : 'Create' }}
                    </UButton>
                </div>
            </div>

            <!-- All other requirement types -->
            <XForm
                v-else
                v-model:state="formState"
                :schema="schema"
                :on-submit="onSubmit"
                :on-cancel="onCancel"
                :disabled="isSubmitting"
                class="space-y-6"
            />
        </UCard>
    </div>
</template>

<style scoped>
/* Hide XForm buttons for Use Cases since we provide our own */
.use-case-form :deep(.flex.gap-2) {
    display: none;
}
</style>
