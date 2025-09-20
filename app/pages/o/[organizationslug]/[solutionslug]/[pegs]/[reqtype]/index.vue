<script lang="ts" setup>
import { ReqType } from '#shared/domain'
import * as req from '#shared/domain/requirements'
import type { RequirementType } from '#shared/domain/requirements'

const route = useRoute(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug, reqtype } = route.params as {
        solutionslug: string
        organizationslug: string
        reqtype: string
    },
    // Convert reqtype to ReqType enum value (e.g., 'assumption' -> 'ASSUMPTION', 'glossary-term' -> 'GLOSSARY_TERM')
    reqTypeSnakeCase = slugToSnakeCase(reqtype),
    reqTypeValue = reqTypeSnakeCase.toUpperCase() as keyof typeof ReqType,
    actualReqType = ReqType[reqTypeValue]

if (!actualReqType) {
    throw createError({
        statusCode: 404,
        statusMessage: `Unknown requirement type: ${reqtype}`
    })
}

const ReqTypePascal = snakeCaseToPascalCase(actualReqType) as keyof typeof req,
    RequirementSchema = req[ReqTypePascal]

if (!RequirementSchema) {
    throw createError({
        statusCode: 404,
        statusMessage: `Requirement entity not found for: ${reqtype}`
    })
}

type RequirementEntity = { reqIdPrefix: string, description: string }

const title = (RequirementSchema as unknown as RequirementEntity).reqIdPrefix ? `${(RequirementSchema as unknown as RequirementEntity).reqIdPrefix} ${snakeCaseToPascalCase(reqtype)}` : snakeCaseToPascalCase(reqtype)

useHead({ title })
definePageMeta({ middleware: 'auth' })

const { data: requirements, refresh, status } = await useFetch<RequirementType[]>(`/api/requirements/${actualReqType}`, {
        query: {
            solutionSlug,
            organizationSlug
        },
        transform: data => data.map(transformRequirementDates)
    }),
    // Check if this is a minimum requirement type and if it's missing
    { isMinimumRequirementType, isRequirementMissing } = useMinimumRequirements(),
    isMinimumType = isMinimumRequirementType(actualReqType),
    showMissingAlert = ref(false)

// Check if this minimum requirement is missing
watch([requirements], async () => {
    if (isMinimumType && requirements.value !== null) {
        const hasMissingRequirement = await isRequirementMissing({
            reqType: actualReqType,
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
        :description="`This requirement type is essential for a complete solution. You must have at least one Active ${snakeCaseToPascalCase(reqtype)} to meet the minimum requirements.`"
        class="mb-6"
    />

    <RequirementList
        :requirements="requirements || []"
        :req-type="actualReqType"
        :organization-slug="organizationSlug"
        :solution-slug="solutionSlug"
        :loading="status === 'pending'"
        @refresh="refresh"
    />
</template>
