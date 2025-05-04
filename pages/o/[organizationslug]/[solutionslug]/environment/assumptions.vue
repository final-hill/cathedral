<script lang="ts" setup>
import { Assumption, ReqType } from '#shared/domain';

useHead({ title: 'Assumptions' })
definePageMeta({ name: 'Assumptions', middleware: 'auth' })

const { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Assumptions').params
</script>

<template>
    <h1>Assumptions</h1>
    <p>{{ Assumption.description }}</p>

    <XWorkflow :organization-slug="organizationSlug" :req-type="ReqType.ASSUMPTION" :solution-slug="solutionSlug" />
</template>