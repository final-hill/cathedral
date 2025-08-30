<script setup lang="tsx">
import { useRoute, useRouter } from 'vue-router'
import { ref, computed } from 'vue'
import { UIcon } from '#components'

definePageMeta({ name: 'SlackLink', middleware: 'auth' })

const route = useRoute(),
    router = useRouter(),
    loading = ref(false),
    error = ref(''),
    slackUserId = route.query.slackUserId as string,
    teamId = route.query.teamId as string,
    token = route.query.token as string

// Validate required parameters
if (!slackUserId || !teamId || !token)
    error.value = 'Missing Slack user information.'

const { user, clear } = useUserSession(),
    currentUser = computed(() => ({
        id: user.value?.id,
        name: user.value?.name,
        email: user.value?.email
    })),
    linkToCurrentUser = async () => {
        if (!currentUser.value.id) return

        loading.value = true
        try {
            await $fetch('/api/slack/link-user', {
                method: 'POST',
                body: { slackUserId, teamId, token }
            })

            // Redirect to success page
            router.push({
                path: '/auth/slack-link-success',
                query: { linked: 'true' }
            })
        } catch (e: unknown) {
            error.value = (e as { data?: { message?: string }, message?: string })?.data?.message
                || (e as { message?: string })?.message || 'Failed to link Slack user.'
        } finally {
            loading.value = false
        }
    },
    cancelLinking = () => {
        router.push('/')
    },
    handleSignOut = async () => {
        await clear()
        await navigateTo('/api/auth/logout', { external: true })
    }
</script>

<template>
    <UCard class="w-2xl m-auto mt-16">
        <template #header>
            <h1 class="text-lg font-semibold leading-6">
                Link Slack Account
            </h1>
        </template>

        <section
            v-if="error"
            class="py-4"
        >
            <UAlert
                color="error"
                variant="soft"
                title="Error"
                :description="error"
                icon="i-lucide-alert-circle"
                class="mb-4"
            />
            <UButton
                color="primary"
                variant="outline"
                class="mx-auto block"
                @click="router.push('/')"
            >
                Return to Cathedral
            </UButton>
        </section>

        <article
            v-else
            class="py-6 space-y-6"
        >
            <header class="text-center">
                <UIcon
                    name="i-lucide-link"
                    class="text-4xl text-primary mb-4 mx-auto block"
                />
                <h2 class="text-lg font-semibold mb-2">
                    Link Your Slack Account
                </h2>
                <p class="text-muted">
                    You're about to link your Slack account to your Cathedral account.
                </p>
            </header>

            <section class="bg-muted border border-default rounded-lg p-4">
                <h3 class="font-medium text-default mb-2">
                    Cathedral Account
                </h3>
                <dl class="space-y-1">
                    <div class="text-sm">
                        <dt class="inline font-semibold">
                            Name:
                        </dt>
                        <dd class="inline ml-1">
                            {{ currentUser.name }}
                        </dd>
                    </div>
                    <div class="text-sm">
                        <dt class="inline font-semibold">
                            Email:
                        </dt>
                        <dd class="inline ml-1">
                            {{ currentUser.email }}
                        </dd>
                    </div>
                </dl>
            </section>

            <section class="bg-info/10 border border-info/20 rounded-lg p-4">
                <h3 class="font-medium text-info mb-2">
                    What happens after linking?
                </h3>
                <ul class="text-sm text-info space-y-1">
                    <li>You can use Cathedral commands in Slack workspaces</li>
                    <li>Messages mentioning @Cathedral will be processed for requirements</li>
                    <li>You can link Slack channels to Cathedral solutions</li>
                    <li>Your Slack identity will be associated with your Cathedral account</li>
                </ul>
            </section>

            <section class="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <h3 class="font-medium text-warning mb-2">
                    Important Notes
                </h3>
                <ul class="text-sm text-warning space-y-1">
                    <li>This will link your Slack account to the currently signed-in Cathedral user</li>
                    <li>If you have multiple Cathedral accounts, make sure you're signed in to the correct one</li>
                    <li>You can unlink this association later using <code>/cathedral-unlink-user</code> in Slack</li>
                </ul>
            </section>

            <nav class="flex space-x-4 justify-center">
                <UButton
                    :loading="loading"
                    color="primary"
                    size="lg"
                    icon="i-lucide-link"
                    @click="linkToCurrentUser"
                >
                    Link to This Account
                </UButton>
                <UButton
                    color="neutral"
                    variant="outline"
                    size="lg"
                    @click="cancelLinking"
                >
                    Cancel
                </UButton>
            </nav>

            <p class="text-xs text-muted text-center">
                Need to switch Cathedral accounts?
                <UButton
                    variant="link"
                    color="primary"
                    size="xs"
                    @click="handleSignOut"
                >
                    Sign out
                </UButton>
                and sign in with a different account.
            </p>
        </article>
    </UCard>
</template>
