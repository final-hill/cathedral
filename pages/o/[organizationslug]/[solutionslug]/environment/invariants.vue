<script lang="ts" setup>
import { Invariant, ReqType } from '#shared/domain'

useHead({ title: 'Invariants' })
definePageMeta({ name: 'Invariants', middleware: 'auth' })

const { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Invariants').params
</script>

<template>
    <h1>E.6 Invariants </h1>
    <p> {{ Invariant.description }} </p>

    <XWorkflow
        :organization-slug="organizationSlug"
        :req-type="ReqType.INVARIANT"
        :solution-slug="solutionSlug"
    />
</template>
