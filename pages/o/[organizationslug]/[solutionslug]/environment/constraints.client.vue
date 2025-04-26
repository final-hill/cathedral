<script lang="ts" setup>
import { Constraint, ReqType } from '#shared/domain'

useHead({ title: 'Constraints' })
definePageMeta({ name: 'Constraints' })

const { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Constraints').params
</script>

<template>
    <h1>Constraints</h1>
    <p>{{ Constraint.description }}</p>

    <XWorkflow :organization-slug="organizationSlug" :req-type="ReqType.CONSTRAINT" :solution-slug="solutionSlug" />
</template>