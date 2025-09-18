<script lang="ts" setup>
import { ReqType } from '#shared/domain'
import * as req from '#shared/domain/requirements'
import { z } from 'zod'
import type { RequirementType } from '#shared/domain/requirements'

const route = useRoute(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug, reqtype: reqType, id } = route.params as {
        solutionslug: string
        organizationslug: string
        reqtype: string
        id: string
    },
    // Convert reqType to ReqType enum value (e.g., 'assumption' -> 'ASSUMPTION', 'glossary-term' -> 'GLOSSARY_TERM')
    reqTypeSnakeCase = slugToSnakeCase(reqType),
    reqTypeValue = reqTypeSnakeCase.toUpperCase() as keyof typeof ReqType,
    actualReqType = ReqType[reqTypeValue]

if (!actualReqType) {
    throw createError({
        statusCode: 404,
        statusMessage: `Unknown requirement type: ${reqType}`
    })
}

const ReqTypePascal = snakeCaseToPascalCase(actualReqType) as keyof typeof req,
    RequirementSchema = req[ReqTypePascal]

if (!RequirementSchema) {
    throw createError({
        statusCode: 404,
        statusMessage: `Requirement entity not found for: ${reqType}`
    })
}

const title = `${snakeCaseToPascalCase(reqType)} Details`

useHead({ title })
definePageMeta({ middleware: 'auth' })

const { data: requirement, status } = await useFetch<RequirementType>(`/api/requirements/${actualReqType}/${id}`, {
        query: { solutionSlug, organizationSlug },
        transform: transformRequirementDates
    }),
    innerSchema = RequirementSchema instanceof z.ZodEffects
        ? RequirementSchema.innerType()
        : RequirementSchema,
    isLoading = computed(() => status.value === 'pending')
</script>

<template>
    <h1>{{ title }}</h1>

    <p class="whitespace-pre">
        {{ RequirementSchema.description }}
    </p>

    <RequirementView
        :requirement="requirement"
        :schema="innerSchema"
        :loading="isLoading"
    />
</template>
