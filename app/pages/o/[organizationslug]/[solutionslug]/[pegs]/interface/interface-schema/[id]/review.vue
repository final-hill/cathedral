<script setup lang="ts">
import { ReqType, WorkflowState, InterfaceSchema } from '#shared/domain'

const route = useRoute(),
    { organizationslug, solutionslug, id } = route.params as {
        organizationslug: string
        solutionslug: string
        id: string
    },
    title = 'Review Interface Schema'

useHead({ title })
definePageMeta({
    middleware: 'auth',
    key: route => route.fullPath
})

const { data: requirement, status, error } = await useApiRequest({ url: `/api/requirements/${ReqType.INTERFACE_SCHEMA}/${id}`, options: {
    query: {
        solutionSlug: solutionslug,
        organizationSlug: organizationslug
    },
    schema: InterfaceSchema,
    // Disable cache to ensure we get fresh data after workflow transitions
    getCachedData: () => undefined
} })

if (error.value) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Interface Schema not found'
    })
}

// Validate that the requirement is in Review state
if (requirement.value && requirement.value.workflowState !== WorkflowState.Review) {
    throw createError({
        statusCode: 403,
        statusMessage: `Cannot review requirement in ${requirement.value.workflowState} state. Only requirements in Review state can be reviewed.`
    })
}
</script>

<template>
    <RequirementReview
        v-if="requirement"
        :requirement="requirement"
        :schema="InterfaceSchema"
        :req-type="ReqType.INTERFACE_SCHEMA"
        :organization-slug="organizationslug"
        :solution-slug="solutionslug"
        :loading="status === 'pending'"
    >
        <!-- Custom JSON Schema editor for schema field -->
        <template #field-schema="{ modelValue }">
            <div v-if="modelValue && Object.keys(modelValue).length > 0">
                <JsonSchemaEditor
                    :model-value="modelValue as object"
                    :disabled="true"
                />
            </div>
            <div
                v-else
                class="text-sm text-muted p-4 border border-dashed rounded-lg"
            >
                No schema definition provided
            </div>
        </template>
    </RequirementReview>
</template>
