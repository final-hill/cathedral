<script lang="ts" setup>
import { Situation, Obstacle, ReqType } from '#shared/domain'

useHead({ title: 'Situation' })
definePageMeta({ name: 'Situation', middleware: 'auth' })

const { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Situation').params
</script>

<template>
    <div>
        <h1>G.2.0 Situation</h1>
        <p> {{ Situation.description }} </p>

        <XWorkflow
            :organization-slug="organizationSlug"
            :req-type="ReqType.SITUATION"
            :solution-slug="solutionSlug"
            :disable-new-requirement="true"
        />

        <h2>Obstacles</h2>
        <p> {{ Obstacle.description }} </p>

        <XWorkflow
            :organization-slug="organizationSlug"
            :req-type="ReqType.OBSTACLE"
            :solution-slug="solutionSlug"
        />
    </div>
</template>
