<script lang="ts" setup>
import { ReqType } from '#shared/domain'
import * as req from '#shared/domain/requirements'
import type { FormSchema } from '~/components/XForm.vue'
import { z } from 'zod'

const route = useRoute(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug, reqtype } = route.params as {
        solutionslug: string
        organizationslug: string
        reqtype: string
    },
    // Convert reqtype to ReqType enum value (e.g., 'assumption' -> 'ASSUMPTION', 'glossary-term' -> 'GLOSSARY_TERM')
    reqTypeSnakeCase = slugToSnakeCase(reqtype), // Convert slug to snake_case
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

const title = `New ${snakeCaseToPascalCase(reqtype)}`

useHead({ title })
definePageMeta({ middleware: 'auth' })

const innerSchema = RequirementSchema instanceof z.ZodEffects
        ? RequirementSchema.innerType()
        : RequirementSchema,
    baseSchema = innerSchema as FormSchema
</script>

<template>
    <RequirementForm
        :schema="baseSchema"
        :req-type="actualReqType"
        :organization-slug="organizationSlug"
        :solution-slug="solutionSlug"
        :is-edit="false"
    />
</template>
