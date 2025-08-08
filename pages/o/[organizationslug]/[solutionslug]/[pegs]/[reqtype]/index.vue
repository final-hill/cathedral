<script lang="ts" setup>
import { ReqType } from '#shared/domain'
import * as req from '#shared/domain/requirements'
import type { RequirementType } from '~/shared/domain'
import { transformRequirementDates } from '~/shared/utils/date-transform'
import { snakeCaseToPascalCase, slugToSnakeCase } from '#shared/utils'

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
    transform: (data: unknown[]) => data.map(item => transformRequirementDates(item as { creationDate: string, lastModified: string }) as unknown as RequirementType)
})
</script>

<template>
    <h1>{{ title }}</h1>
    <p>
        {{ (RequirementSchema as unknown as RequirementEntity).description }}
    </p>

    <RequirementList
        :requirements="requirements || []"
        :req-type="actualReqType"
        :organization-slug="organizationSlug"
        :solution-slug="solutionSlug"
        :loading="status === 'pending'"
        @refresh="refresh"
    />
</template>
