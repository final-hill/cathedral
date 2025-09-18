<script lang="ts" setup>
import { ReqType } from '#shared/domain'
import { UseCase } from '#shared/domain/requirements'
import type { FormSchema } from '~/components/XForm.vue'
import type { ScenarioStepReferenceType } from '#shared/domain/requirements/EntityReferences'
import { z } from 'zod'

const route = useRoute(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug } = route.params as {
        solutionslug: string
        organizationslug: string
    },
    title = 'New Use Case'

useHead({ title })
definePageMeta({ middleware: 'auth' })

const innerSchema = UseCase instanceof z.ZodEffects
        ? UseCase.innerType()
        : UseCase,
    // Apply omits specific to use case scenario handling
    baseSchema = (innerSchema as FormSchema).omit({
        mainSuccessScenario: true, // Remove from form - handled separately
        extensions: true // Remove from form - handled separately
    }),
    scenarioData = ref({
        mainSteps: [] as ScenarioStepReferenceType[],
        extensions: [] as ScenarioStepReferenceType[]
    }),
    onBeforeSave = (data: Record<string, unknown>) => {
        data.mainSuccessScenario = scenarioData.value.mainSteps
        data.extensions = scenarioData.value.extensions
    },
    onSaved = (_savedRequirement: Record<string, unknown>) => {
        // The form component handles navigation
    }
</script>

<template>
    <RequirementForm
        :schema="baseSchema"
        :req-type="ReqType.USE_CASE"
        :organization-slug="organizationSlug"
        :solution-slug="solutionSlug"
        :is-edit="false"
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
