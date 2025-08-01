<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

definePageMeta({ name: 'SlackLinkSuccess' })

const route = useRoute()
const router = useRouter()

const isLinked = route.query.linked === 'true'

const goHome = () => {
    router.push('/')
}

// Redirect to homepage after 5 seconds
setTimeout(() => {
    router.push('/')
}, 5000)
</script>

<template>
    <UCard class="w-2xl m-auto mt-16">
        <template #header>
            <h2 class="text-lg font-semibold leading-6">
                Slack Account Linking
            </h2>
        </template>

        <div
            v-if="isLinked"
            class="py-6 space-y-6"
        >
            <UAlert
                color="success"
                variant="soft"
                title="Success!"
                description="Your Slack account has been successfully linked to your Cathedral account!"
                icon="i-lucide-check-circle"
            />

            <UAlert
                color="info"
                variant="soft"
                title="What's Next?"
                description="You can now use Cathedral commands in Slack workspaces where the Cathedral app is installed."
                icon="i-lucide-info"
            />

            <UAlert
                color="info"
                variant="outline"
                title="Available Slack Commands"
                icon="i-lucide-terminal"
            >
                <template #description>
                    <ul class="text-sm space-y-1 mt-2">
                        <li><code>/cathedral-help</code> - Show available commands</li>
                        <li><code>/cathedral-link-solution</code> - Link a channel to a solution</li>
                        <li><code>/cathedral-unlink-solution</code> - Unlink a channel from a solution</li>
                        <li><code>/cathedral-unlink-user</code> - Unlink your Slack account</li>
                    </ul>
                </template>
            </UAlert>

            <div class="text-center space-y-3">
                <p class="text-sm text-muted">
                    Redirecting you to the homepage in a few seconds...
                </p>
                <UButton
                    color="primary"
                    size="lg"
                    @click="goHome"
                >
                    Continue to Cathedral
                </UButton>
            </div>
        </div>

        <div
            v-else
            class="py-6"
        >
            <UAlert
                color="error"
                variant="soft"
                title="Link Failed"
                description="Something went wrong with linking your Slack account. Please try again or contact support if the problem persists."
                icon="i-lucide-x-circle"
                :actions="[{
                    label: 'Return to Cathedral',
                    color: 'primary',
                    variant: 'outline',
                    onClick: goHome
                }]"
            />
        </div>
    </UCard>
</template>
