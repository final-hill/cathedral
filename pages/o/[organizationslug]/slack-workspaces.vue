<script setup lang="ts">
useHead({ title: 'Slack Workspaces' })
definePageMeta({ name: 'Slack Workspaces', middleware: 'auth' })

const route = useRoute(),
    params = route.params as { organizationslug: string },
    organizationSlug = params.organizationslug
</script>

<template>
    <div class="space-y-6">
        <div>
            <h1 class="text-2xl font-bold">
                Slack Workspace Integration
            </h1>
            <p class="text-muted">
                Manage Slack workspace connections for this organization. Connected workspaces allow users to interact
                with Cathedral through slash commands and app mentions.
            </p>
        </div>

        <SlackWorkspaceManager
            :organization-slug="organizationSlug"
            :show-management="true"
        />
    </div>
</template>
