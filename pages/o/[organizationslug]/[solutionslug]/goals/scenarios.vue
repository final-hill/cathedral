<script lang="ts" setup>
import { Epic, ReqType } from '#shared/domain'

useHead({ title: 'Scenarios' })
definePageMeta({ name: 'Goal Scenarios', middleware: 'auth' })

const { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Scenarios').params
</script>

<template>
    <h1>Scenarios</h1>

    <p> {{ Epic.description }} </p>
    <p>
        Before you can begin, you must define one or more
        <NuxtLink class="underline"
            :to="{ name: 'Stakeholders', params: { solutionslug: solutionSlug, organizationslug: organizationSlug } }">
            Stakeholders</NuxtLink>,
        <NuxtLink class="underline"
            :to="{ name: 'Goals Functionality', params: { solutionslug: solutionSlug, organizationslug: organizationSlug } }"
            v-text="'Functional Behaviors'" />,
        and <NuxtLink class="underline"
            :to="{ name: 'Outcomes', params: { solutionslug: solutionSlug, organizationslug: organizationSlug } }">
            Outcomes
        </NuxtLink>
        for the solution.
    </p>

    <XWorkflow :organization-slug="organizationSlug" :req-type="ReqType.EPIC" :solution-slug="solutionSlug" />
</template>