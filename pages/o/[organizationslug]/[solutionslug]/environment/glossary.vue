<script lang="ts" setup>
import { GlossaryTerm, ReqType } from '#shared/domain'

useHead({ title: 'Glossary' })
definePageMeta({ name: 'Glossary', middleware: 'auth' })

const { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Glossary').params;
</script>

<template>
    <h1>E.1 Glossary</h1>
    <p>{{ GlossaryTerm.description }}</p>

    <XWorkflow :organization-slug="organizationSlug" :req-type="ReqType.GLOSSARY_TERM" :solution-slug="solutionSlug" />
</template>