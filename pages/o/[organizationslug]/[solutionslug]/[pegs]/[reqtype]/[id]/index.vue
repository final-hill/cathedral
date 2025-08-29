<script lang="ts" setup>
import { ReqType } from '#shared/domain'
import * as req from '#shared/domain/requirements'
import type { RequirementType } from '~/shared/domain'
import { transformRequirementDates } from '~/shared/utils/date-transform'
import { snakeCaseToPascalCase, slugToSnakeCase } from '#shared/utils'
import { z } from 'zod'
import type { ZodRawShape } from 'zod'

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
        transform: (data: unknown) => transformRequirementDates(
            data as { creationDate: string, lastModified: string }
        ) as unknown as RequirementType
    }),
    innerSchema = RequirementSchema instanceof z.ZodEffects
        ? RequirementSchema.innerType()
        : RequirementSchema,
    viewSchema = (innerSchema as z.ZodObject<ZodRawShape>).omit({
        reqType: true,
        createdBy: true,
        creationDate: true,
        lastModified: true,
        id: true,
        isDeleted: true,
        modifiedBy: true,
        solution: true,
        parsedRequirements: true,
        workflowState: true,
        reqIdPrefix: true
    }),
    isLoading = computed(() => status.value === 'pending')
</script>

<template>
    <h1>{{ title }}</h1>

    <p class="whitespace-pre">
        {{ RequirementSchema.description }}
    </p>

    <RequirementView
        :requirement="requirement"
        :schema="viewSchema"
        :loading="isLoading"
        :organization-slug="organizationSlug"
        :solution-slug="solutionSlug"
    />
</template>
