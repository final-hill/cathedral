<script lang="ts" setup>
import { ReqType } from '#shared/domain'

const route = useRoute(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug } = route.params as {
        solutionslug: string
        organizationslug: string
    },
    reqType = ReqType.PARSED_REQUIREMENTS,
    title = `New ${snakeCaseToPascalCase(reqType)}`

useHead({ title })
definePageMeta({ middleware: 'auth' })
</script>

<template>
    <FreeFormRequirements
        :solution-slug="solutionSlug"
        :organization-slug="organizationSlug"
    />
</template>
