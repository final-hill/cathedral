<script lang="ts" setup>
import { Outcome, ReqType } from '#shared/domain'

useHead({ title: 'Outcomes' })
definePageMeta({ name: 'Outcomes', middleware: 'auth' })

const { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Outcomes').params
</script>

<template>
    <h1>G.3 Outcomes</h1>
    <p> {{ Outcome.description }} </p>

    <XWorkflow
        :organization-slug="organizationSlug"
        :req-type="ReqType.OUTCOME"
        :solution-slug="solutionSlug"
    />
</template>
