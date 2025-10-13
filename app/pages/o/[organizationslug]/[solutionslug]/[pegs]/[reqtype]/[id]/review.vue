<script lang="ts" setup>
import { ReqType, WorkflowState } from '#shared/domain'
import * as req from '#shared/domain/requirements'
import type { FormSchema } from '~/components/XForm.vue'
import { z } from 'zod'

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

const title = `Review ${snakeCaseToPascalCase(reqType)}`

useHead({ title })
definePageMeta({ middleware: 'auth' })

const { data: requirement, status, error } = await useApiRequest({ url: `/api/requirements/${actualReqType}/${id}`, options: {
    query: { solutionSlug, organizationSlug },
    schema: RequirementSchema
} })

if (error.value) {
    throw createError({
        statusCode: 404,
        statusMessage: `${snakeCaseToPascalCase(reqType)} not found`
    })
}

// Validate that the requirement is in Review state
if (requirement.value && requirement.value.workflowState !== WorkflowState.Review) {
    throw createError({
        statusCode: 403,
        statusMessage: `Cannot review requirement in ${requirement.value.workflowState} state. Only requirements in Review state can be reviewed.`
    })
}

const innerSchema = RequirementSchema instanceof z.ZodEffects
        ? RequirementSchema.innerType()
        : RequirementSchema,
    baseSchema = innerSchema as FormSchema
</script>

<template>
    <RequirementReview
        v-if="requirement"
        :requirement="requirement"
        :schema="baseSchema"
        :req-type="actualReqType"
        :organization-slug="organizationSlug"
        :solution-slug="solutionSlug"
        :loading="status === 'pending'"
    />
</template>
