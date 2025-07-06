<script lang="ts" setup>
import { Limit, ReqType } from '#shared/domain'

useHead({ title: 'Limitations' })
definePageMeta({ name: 'Limitations', middleware: 'auth' })

const { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Limitations').params
</script>

<template>
    <h1>G.6 Limitations </h1>
    <p> {{ Limit.description }} </p>

    <XWorkflow
        :organization-slug="organizationSlug"
        :req-type="ReqType.LIMIT"
        :solution-slug="solutionSlug"
    />
</template>
