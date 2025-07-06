<script setup lang="ts">
useHead({ title: 'Slack Channels' })
definePageMeta({ name: 'Slack Channels', middleware: 'auth' })

const route = useRoute()
const params = route.params as { organizationslug: string, solutionslug: string }
const solutionSlug = params.solutionslug
const organizationSlug = params.organizationslug
</script>

<template>
    <h1>Slack Channel Links</h1>

    <p>
        Manage Slack channels linked to this solution. Users can mention @cathedral in these channels to create
        requirements automatically.
    </p>

    <SlackChannelManager
        :organization-slug="organizationSlug"
        :solution-slug="solutionSlug"
        :show-management="true"
    />
</template>
