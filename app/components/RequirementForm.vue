<script lang="ts" setup>
import { z } from 'zod'
import type * as req from '#shared/domain/requirements'
import type { FormSchema } from '~/components/XForm.vue'
import { WorkflowState } from '#shared/domain/requirements/enums'
import { uiBasePathTemplates } from '#shared/domain/requirements/uiBasePathTemplates'

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
        saved: [requirement: Record<string, unknown>]
        cancelled: []
        beforeSave: [data: Record<string, unknown>]
    }>(),
    { requirement, schema, reqType, organizationSlug, solutionSlug, isEdit, loading = false } = toRefs(props),
    isEditValue = computed(() => isEdit?.value ?? false),
    basePath = computed(() => {
        const template = uiBasePathTemplates[reqType.value as keyof typeof uiBasePathTemplates]
        return template
            .replace('[org]', organizationSlug.value)
            .replace('[solutionslug]', solutionSlug.value)
    }),
    commonOmits = {
        reqId: true,
        reqIdPrefix: true,
        createdBy: true,
        creationDate: true,
        lastModified: true,
        id: true,
        workflowState: true,
        reqType: true,
        isDeleted: true,
        modifiedBy: true,
        solution: true,
        parsedRequirements: true,
        uiBasePathTemplate: true
    } as const,
    formSchema = computed(() => {
        const innerSchema = schema.value instanceof z.ZodEffects
            ? schema.value.innerType()
            : schema.value

        return (innerSchema as z.ZodObject<z.ZodRawShape>).omit(commonOmits)
    })

// Validate that the requirement can be edited based on workflow state when in edit mode
if (isEditValue.value && requirement?.value && ![WorkflowState.Proposed, WorkflowState.Active].includes(requirement.value.workflowState)) {
    throw createError({
        statusCode: 403,
        statusMessage: `Cannot edit requirement in ${requirement.value.workflowState} state. Only Proposed and Active requirements can be edited.`
    })
}

const router = useRouter(),
    route = useRoute(),
    toast = useToast(),
    formState = reactive<Partial<req.RequirementType>>({}),
    isSubmitting = ref(false),
    // Create autocomplete context from URL parameters for new requirements
    autocompleteContext = computed(() => {
        if (isEditValue.value || !route.query) return {}

        const context: Record<string, string> = {}
        Object.entries(route.query).forEach(([key, value]) => {
            if (typeof value === 'string' && value.trim())
                context[key] = value.trim()
        })
        return context
    }),
    initializeFormState = () => {
        const initialData = {} as Partial<req.RequirementType>

        if (requirement?.value) {
            for (const [key, value] of Object.entries(requirement.value)) {
            // Transform reference objects to match autocomplete format
                if (value && typeof value === 'object' && 'reqType' in value && 'id' in value && 'name' in value) {
                    // With value-key="value", the model value should be the {id, name} object
                    // UInputMenu will find the matching item in the list and display its label
                    (initialData as Record<string, unknown>)[key] = { id: value.id, name: value.name }
                } else
                    (initialData as Record<string, unknown>)[key] = value
            }
        }

        Object.assign(formState, initialData)
    }

initializeFormState()

// Watch for route changes and reinitialize
watch(() => route.query, () => {
    if (!isEditValue.value)
        initializeFormState()
}, { deep: true })

const onSubmit = async (data?: Record<string, unknown>) => {
        isSubmitting.value = true
        try {
            let result: req.RequirementType,
                submitData = data || {}

            // Emit beforeSave event to allow parent to modify data
            emit('beforeSave', submitData)

            // Trim string values in the submit data
            submitData = Object.keys(submitData).reduce((acc, key) => {
                const value = submitData[key as keyof typeof submitData]
                if (typeof value === 'string')
                    acc[key] = value.trim()
                else if (Array.isArray(value)) {
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
                result = await $fetch<req.RequirementType>(endpoint, {
                    method: 'POST',
                    body: {
                        ...submitData,
                        solutionSlug: solutionSlug.value,
                        organizationSlug: organizationSlug.value
                    } as Record<string, unknown>
                })
                result = requirement.value
            } else {
                const newId = await $fetch<string>(`/api/requirements/${reqType.value}/proposed`, {
                    method: 'PUT',
                    body: {
                        ...submitData,
                        solutionSlug: solutionSlug.value,
                        organizationSlug: organizationSlug.value
                    }
                })

                result = await $fetch<req.RequirementType>(`/api/requirements/${reqType.value}/${newId}`, {
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

            router.push(`${basePath.value}/${result.id}`)
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
    <article class="requirement-form">
        <!-- Loading State -->
        <section
            v-if="loading"
            class="flex items-center justify-center min-h-96"
            aria-live="polite"
            aria-label="Loading requirement"
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
        </section>

        <!-- Form Content -->
        <UCard v-else>
            <template #header>
                <header class="flex items-center justify-between">
                    <h1 class="text-2xl font-bold text-highlighted">
                        {{ isEditValue ? 'Edit' : 'New' }} {{ snakeCaseToTitleCase(reqType) }}
                    </h1>
                    <UButton
                        color="neutral"
                        variant="ghost"
                        icon="i-lucide-x"
                        aria-label="Cancel and close form"
                        @click="onCancel"
                    />
                </header>
            </template>

            <section
                aria-label="Requirement Form"
            >
                <XForm
                    :state="formState"
                    :schema="formSchema"
                    :disabled="isSubmitting"
                    :autocomplete-context="autocompleteContext"
                    class="space-y-6"
                    @submit="onSubmit"
                    @cancel="onCancel"
                >
                    <!-- Pass through all slots from parent -->
                    <template
                        v-for="(_, slotName) in $slots"
                        :key="slotName"
                        #[slotName]="slotProps"
                    >
                        <slot
                            :name="slotName"
                            v-bind="slotProps"
                        />
                    </template>
                </XForm>
            </section>
        </UCard>
    </article>
</template>
