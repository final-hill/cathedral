<script lang="ts" setup>
import { ReqType } from '#shared/domain'
import * as req from '#shared/domain/requirements'

const route = useRoute(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug, id, reqtype } = route.params as {
        solutionslug: string
        organizationslug: string
        id: string
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

const title = `Edit ${snakeCaseToPascalCase(reqtype)}`

useHead({ title })
definePageMeta({ middleware: 'auth' })

const { data: requirement, error } = await useApiRequest({ url: `/api/requirements/${actualReqType}/${id}`, options: {
    query: {
        solutionSlug,
        organizationSlug
    },
    schema: RequirementSchema
} })

if (error.value) {
    throw createError({
        statusCode: 404,
        statusMessage: `${snakeCaseToPascalCase(reqtype)} not found`
    })
}

const onSaved = (_savedRequirement: Record<string, unknown>) => {
    // The form component handles navigation
}
</script>

<template>
    <RequirementForm
        :schema="RequirementSchema"
        :req-type="actualReqType"
        :organization-slug="organizationSlug"
        :solution-slug="solutionSlug"
        :is-edit="true"
        :requirement="requirement"
        @saved="onSaved"
    />
</template>
