<script setup lang="ts">
import { z } from 'zod'
import { ReqType, WorkflowState, InterfaceSchema } from '#shared/domain'
import type { FormSchema } from '~/components/XForm.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute(),
    { organizationslug, solutionslug, pegs: _pegs, id } = route.params as {
        organizationslug: string
        solutionslug: string
        pegs: string
        id: string
    },
    title = 'Review Interface Schema'

useHead({ title })

const { data: requirement, status, error } = await useApiRequest(`/api/requirements/${ReqType.INTERFACE_SCHEMA}/${id}`, {
    query: {
        solutionSlug: solutionslug,
        organizationSlug: organizationslug
    },
    schema: InterfaceSchema
})

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

const innerSchema = InterfaceSchema instanceof z.ZodEffects
        ? InterfaceSchema.innerType()
        : InterfaceSchema,
    baseSchema = innerSchema as FormSchema
</script>

<template>
    <RequirementReview
        v-if="requirement"
        :requirement="requirement"
        :schema="baseSchema"
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
