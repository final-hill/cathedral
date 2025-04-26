<script lang="ts" setup>
import { FunctionalBehavior, ReqType } from '#shared/domain';

useHead({ title: 'Functionality' })
definePageMeta({ name: 'Goals Functionality' })

const { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Functionality').params
</script>

<template>
    <h1>Functionality</h1>
    <p>{{ FunctionalBehavior.description }}</p>

    <XWorkflow :organization-slug="organizationSlug" :req-type="ReqType.FUNCTIONAL_BEHAVIOR"
        :solution-slug="solutionSlug" />
</template>