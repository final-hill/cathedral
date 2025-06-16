<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';

definePageMeta({ name: 'SlackLink', middleware: 'auth' });

const route = useRoute(),
    status = ref<'pending' | 'success' | 'error'>('pending'),
    errorMessage = ref('');

onMounted(async () => {
    const slackUserId = route.query.slackUserId as string,
        teamId = route.query.teamId as string,
        token = route.query.token as string;

    if (!slackUserId || !teamId || !token) {
        status.value = 'error';
        errorMessage.value = 'Missing Slack user information.';
        return;
    }

    // Call API to link Slack user to Cathedral user
    try {
        await $fetch('/api/slack/link-user', {
            method: 'POST',
            body: { slackUserId, teamId, token },
        });
        status.value = 'success';
    } catch (e: any) {
        status.value = 'error';
        errorMessage.value = e.data?.message || e.message || 'Failed to link Slack user.';
    }
});
</script>

<template>
    <UCard class="w-2xl m-auto mt-16">
        <template #header>
            <h2 class="text-lg font-semibold leading-6">Slack Link</h2>
        </template>
        <div v-if="status === 'pending'">
            <p>Linking your Slack account, please wait...</p>
        </div>
        <div v-else-if="status === 'success'">
            <p>Your Slack account has been successfully linked to your Cathedral account!</p>
        </div>
        <div v-else>
            <p class="text-red-600">{{ errorMessage }}</p>
        </div>
    </UCard>
</template>