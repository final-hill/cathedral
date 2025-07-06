<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref } from 'vue'

definePageMeta({ name: 'SlackLink', middleware: 'auth' })

const route = useRoute()
const status = ref<'pending' | 'success' | 'error'>('pending')
const errorMessage = ref('')

const slackUserId = route.query.slackUserId as string
const teamId = route.query.teamId as string
const token = route.query.token as string

// Validate required parameters
if (!slackUserId || !teamId || !token) {
    status.value = 'error'
    errorMessage.value = 'Missing Slack user information.'
} else {
    // Execute the linking immediately
    try {
        await $fetch('/api/slack/link-user', {
            method: 'POST',
            body: { slackUserId, teamId, token }
        })
        status.value = 'success'
    } catch (e: unknown) {
        status.value = 'error'
        errorMessage.value = (e as { data?: { message?: string }, message?: string })?.data?.message
            || (e as { message?: string })?.message || 'Failed to link Slack user.'
    }
}
</script>

<template>
    <UCard class="w-2xl m-auto mt-16">
        <template #header>
            <h2 class="text-lg font-semibold leading-6">
                Slack Link
            </h2>
        </template>
        <div v-if="status === 'pending'">
            <p>Linking your Slack account, please wait...</p>
        </div>
        <div v-else-if="status === 'success'">
            <p>Your Slack account has been successfully linked to your Cathedral account!</p>
        </div>
        <div v-else>
            <UAlert
                color="error"
                variant="soft"
                title="Link Failed"
                :description="errorMessage"
                icon="i-lucide-alert-circle"
            />
        </div>
    </UCard>
</template>
