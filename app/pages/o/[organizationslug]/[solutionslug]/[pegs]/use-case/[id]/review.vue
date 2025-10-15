<script lang="ts" setup>
import { ReqType, WorkflowState } from '#shared/domain'
import { UseCase } from '#shared/domain/requirements'

const route = useRoute(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug, id } = route.params as {
        solutionslug: string
        organizationslug: string
        id: string
    },
    title = 'Review Use Case'

useHead({ title })
definePageMeta({ middleware: 'auth' })

const { data: requirement, status, error } = await useApiRequest({ url: `/api/requirements/${ReqType.USE_CASE}/${id}`, options: {
    query: { solutionSlug, organizationSlug },
    schema: UseCase
} })

if (error.value) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Use Case not found'
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
        :schema="UseCase"
        :req-type="ReqType.USE_CASE"
        :organization-slug="organizationSlug"
        :solution-slug="solutionSlug"
        :loading="status === 'pending'"
    >
        <!-- Use Case specific content -->
        <template #additional-content>
            <ScenarioStepsEditor
                :main-steps="requirement?.mainSuccessScenario || []"
                :extensions="requirement?.extensions || []"
                label="Scenarios"
                :disabled="true"
            />
        </template>
    </RequirementReview>
</template>
