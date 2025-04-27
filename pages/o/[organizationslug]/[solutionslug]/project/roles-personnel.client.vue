<script lang="ts" setup>
import { Person, ReqType } from '#shared/domain'

useHead({ title: 'Roles & Personnel' })
definePageMeta({ name: 'Roles & Personnel' })

const { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Roles & Personnel').params
</script>

<template>
    <h1>Roles &amp; Personnel</h1>
    <p>{{ Person.description }}</p>

    <XWorkflow :organization-slug="organizationSlug" :req-type="ReqType.PERSON" :solution-slug="solutionSlug" />
</template>