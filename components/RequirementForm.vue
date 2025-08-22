<script lang="ts" setup>
import type * as req from '#shared/domain/requirements'
import type { FormSchema } from '~/components/XForm.vue'
import { WorkflowState } from '#shared/domain/requirements/enums'

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
    isSubmitting = ref(false),
    onSubmit = async (data: Record<string, unknown>) => {
        isSubmitting.value = true
        try {
            let result: req.RequirementType

            if (isEditValue.value && requirement?.value?.id) {
                const endpoint = `/api/requirements/${reqType.value}/${requirement.value.workflowState.toLowerCase()}/${requirement.value.id}/edit`
                result = await $fetch(endpoint, {
                    method: 'POST',
                    body: {
                        ...data,
                        solutionSlug: solutionSlug.value,
                        organizationSlug: organizationSlug.value
                    }
                })
                result = requirement.value
            } else {
                const newId = await $fetch(`/api/requirements/${reqType.value}/propose`, {
                    method: 'PUT',
                    body: {
                        ...data,
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

            <XForm
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
