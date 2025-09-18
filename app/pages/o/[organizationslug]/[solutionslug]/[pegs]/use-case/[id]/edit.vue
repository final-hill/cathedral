<script lang="ts" setup>
import { ReqType } from '#shared/domain'
import { UseCase } from '#shared/domain/requirements'
import type { UseCaseType } from '#shared/domain/requirements'
import type { FormSchema } from '~/components/XForm.vue'
import { z } from 'zod'

const route = useRoute(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug, id } = route.params as {
        solutionslug: string
        organizationslug: string
        id: string
    },
    title = 'Edit Use Case'

useHead({ title })
definePageMeta({ middleware: 'auth' })

const { data: requirement, error } = await useFetch<UseCaseType>(`/api/requirements/${ReqType.USE_CASE}/${id}`, {
    query: {
        solutionSlug,
        organizationSlug
    },
    transform: transformRequirementDates
})

if (error.value) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Use Case not found'
    })
}

const innerSchema = UseCase instanceof z.ZodEffects
        ? UseCase.innerType()
        : UseCase,
    // Apply omits specific to use case scenario handling
    baseSchema = (innerSchema as FormSchema).omit({
        mainSuccessScenario: true, // Remove from form - handled separately
        extensions: true // Remove from form - handled separately
    }),
    // Scenario data managed independently
    scenarioData = ref({
        mainSteps: [...(requirement.value?.mainSuccessScenario || [])],
        extensions: [...(requirement.value?.extensions || [])]
    }),
    onBeforeSave = (data: Record<string, unknown>) => {
        // Mutate the data to include scenario information
        data.mainSuccessScenario = scenarioData.value.mainSteps
        data.extensions = scenarioData.value.extensions
    },
    onSaved = (_savedRequirement: Record<string, unknown>) => {
        // The form component handles navigation
    }
</script>

<template>
    <RequirementForm
        :requirement="requirement"
        :schema="baseSchema"
        :req-type="ReqType.USE_CASE"
        :organization-slug="organizationSlug"
        :solution-slug="solutionSlug"
        :is-edit="true"
        @before-save="onBeforeSave"
        @saved="onSaved"
    >
        <template #additional-content>
            <ScenarioStepsEditor
                :main-steps="scenarioData.mainSteps"
                :extensions="scenarioData.extensions"
                label="Scenarios"
                @update:main-steps="(newSteps) => scenarioData.mainSteps = newSteps"
                @update:extensions="(newExtensions) => scenarioData.extensions = newExtensions"
            />
        </template>
    </RequirementForm>
</template>
