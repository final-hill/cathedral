<script lang="ts" setup>
import { ReqType } from '#shared/domain'
import * as req from '#shared/domain/requirements'
import { z } from 'zod'

const route = useRoute(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug } = route.params as {
        solutionslug: string
        organizationslug: string
    },
    reqType = ReqType.CONTEXT_AND_OBJECTIVE,
    RequirementSchema = req.ContextAndObjective

type RequirementEntity = { reqIdPrefix: string, description: string }

const title = `${(RequirementSchema as unknown as RequirementEntity).reqIdPrefix} Context And Objective`

useHead({ title })
definePageMeta({ middleware: 'auth' })

const { data: requirements, refresh, status } = await useApiRequest({ url: `/api/requirements/${reqType}`, options: {
        query: {
            solutionSlug,
            organizationSlug
        },
        schema: z.array(RequirementSchema)
    } }),
    // Check if this is a minimum requirement type and if it's missing
    { isMinimumRequirementType, isRequirementMissing } = useMinimumRequirements(),
    isMinimumType = isMinimumRequirementType(reqType),
    showMissingAlert = ref(false),
    // Check if there's an Active Context and Objective (singleton requirement)
    hasActiveRequirement = computed(() => {
        if (!requirements.value) return false
        return requirements.value.some(req => req.workflowState === 'Active')
    })

// Check if this minimum requirement is missing
watch([requirements], async () => {
    if (isMinimumType && requirements.value !== null) {
        const hasMissingRequirement = await isRequirementMissing({
            reqType,
            organizationSlug,
            solutionSlug
        }).catch(() => false)

        showMissingAlert.value = hasMissingRequirement
    }
}, { immediate: true })
</script>

<template>
    <h1>{{ title }}</h1>
    <p class="whitespace-pre">
        {{ (RequirementSchema as unknown as RequirementEntity).description }}
    </p>

    <UAlert
        v-if="showMissingAlert"
        color="warning"
        variant="soft"
        icon="i-lucide-alert-triangle"
        title="Minimum Requirement Missing"
        description="This requirement type is essential for a complete solution. You must have at least one Active Context And Objective to meet the minimum requirements."
        class="mb-6"
    />

    <UAlert
        v-if="hasActiveRequirement"
        color="info"
        variant="soft"
        icon="i-lucide-info"
        title="Singleton Requirement"
        description="Context and Objective is a singleton requirement - only one Active version can exist at a time. To update it, use the Edit or Revise action on the existing requirement."
        class="mb-6"
    />

    <RequirementList
        :requirements="requirements || []"
        :req-type="reqType"
        :organization-slug="organizationSlug"
        :solution-slug="solutionSlug"
        :loading="status === 'pending'"
        :hide-new="hasActiveRequirement"
        @refresh="refresh"
    />
</template>
