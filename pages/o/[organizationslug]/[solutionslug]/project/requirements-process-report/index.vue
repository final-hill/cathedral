<script lang="tsx" setup>
import { ReqType } from '~/shared/domain'

useHead({ title: 'Requirements Process and Report' })
definePageMeta({ name: 'Requirements Process and Report', middleware: 'auth' })

const route = useRoute()
const { solutionslug: solutionSlug, organizationslug: organizationSlug } = route.params as { solutionslug: string, organizationslug: string }
</script>

<template>
    <h1>P.7 Requirements Process and Report</h1>

    <p>Manage and review the requirements process and reports.</p>

    <h2>Free-Form Requirements</h2>

    <XWorkflow
        :organization-slug="organizationSlug"
        :req-type="ReqType.PARSED_REQUIREMENTS"
        :solution-slug="solutionSlug"
    />
</template>
