<script setup lang="ts">
import { PendingReviewsDto } from '#shared/dto/PendingReviewDto'
import type { PendingReviewDtoType } from '#shared/dto/PendingReviewDto'
import { snakeCaseToTitleCase } from '#shared/utils'

const props = defineProps<{
        organizationSlug: string
        solutionSlug: string
    }>(),
    queryParams = computed(() => {
        const params: Record<string, string> = {}
        if (props.organizationSlug) params.organizationSlug = props.organizationSlug
        if (props.solutionSlug) params.solutionSlug = props.solutionSlug
        return params
    }),
    { data: pendingReviews, refresh, pending, error } = useApiRequest({ url: '/api/pending-reviews', options: {
        schema: PendingReviewsDto,
        query: queryParams,
        errorMessage: 'Failed to load pending reviews'
    } }),
    hasPendingReviews = computed(() => {
        return (pendingReviews.value || []).length > 0
    }),
    getReviewLink = (review: PendingReviewDtoType) => {
        const { requirement } = review,
            basePath = requirement.uiBasePathTemplate
                ?.replace('[org]', props.organizationSlug)
                .replace('[solutionslug]', props.solutionSlug)

        return `${basePath}/${requirement.id}/review`
    },
    getRequirementDisplayName = (review: PendingReviewDtoType) => {
        const { requirement } = review,
            displayId = requirement.reqIdPrefix || requirement.id
        return `${displayId} - ${requirement.name}`
    },
    getEndorsementCategoryDisplay = (review: PendingReviewDtoType) => {
        const category = review.endorsement.category
        return snakeCaseToTitleCase(category.toLowerCase())
    },
    // Auto-refresh every 5 minutes when the component is visible
    isVisible = ref(true)

let refreshInterval: NodeJS.Timeout | null = null

onMounted(() => {
    // Initial load
    refresh()

    // Set up auto-refresh
    refreshInterval = setInterval(() => {
        if (isVisible.value)
            refresh()
    }, 5 * 60 * 1000) // 5 minutes
})

onUnmounted(() => {
    if (refreshInterval)
        clearInterval(refreshInterval)
})

// TODO: Handle dismiss of individual notifications (optional future enhancement)
const dismissedNotifications = ref<Set<string>>(new Set()),
    visibleReviews = computed(() => {
        if (!pendingReviews.value) return []
        return pendingReviews.value.filter(review => !dismissedNotifications.value.has(review.endorsement.id))
    }),
    visibleReviewsCount = computed(() => visibleReviews.value.length),
    isOpen = ref(false)
</script>

<template>
    <UDrawer
        v-if="hasPendingReviews && visibleReviewsCount > 0"
        v-model:open="isOpen"
        title="Pending Reviews"
        :description="`You have ${visibleReviewsCount} requirement${visibleReviewsCount === 1 ? '' : 's'} waiting for your review`"
    >
        <UButton
            color="warning"
            variant="outline"
            leading-icon="i-lucide-bell"
            trailing-icon="i-lucide-chevron-up"
            :label="`${visibleReviewsCount} Pending Review${visibleReviewsCount === 1 ? '' : 's'}`"
            @click="isOpen = true"
        />

        <template #body>
            <div class="space-y-4">
                <!-- Error state -->
                <UAlert
                    v-if="error"
                    color="error"
                    variant="soft"
                    icon="i-lucide-alert-triangle"
                    title="Failed to load pending reviews"
                    :description="`${error}. Click to try again.`"
                    :actions="[{
                        label: 'Try again',
                        color: 'error',
                        variant: 'ghost',
                        onClick: () => refresh()
                    }]"
                />

                <!-- Loading state -->
                <UAlert
                    v-else-if="pending"
                    color="warning"
                    variant="soft"
                    icon="i-lucide-loader-2"
                    title="Loading pending reviews..."
                    class="animate-pulse"
                />

                <!-- Reviews list -->
                <div
                    v-else
                    class="space-y-2"
                >
                    <NuxtLink
                        v-for="review in visibleReviews"
                        :key="review.endorsement.id"
                        :to="getReviewLink(review)"
                        class="block"
                        @click="isOpen = false"
                    >
                        <UCard
                            variant="subtle"
                            class="hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-warning"
                        >
                            <div class="flex items-start justify-between">
                                <div class="space-y-1 flex-1 min-w-0">
                                    <div class="flex items-center gap-2">
                                        <UIcon
                                            name="i-lucide-file-text"
                                            class="size-4 text-warning flex-shrink-0"
                                        />
                                        <span class="font-medium text-highlighted truncate">
                                            {{ getRequirementDisplayName(review) }}
                                        </span>
                                    </div>
                                    <p class="text-sm text-muted">
                                        {{ getEndorsementCategoryDisplay(review) }} endorsement needed
                                    </p>
                                </div>
                                <UIcon
                                    name="i-lucide-chevron-right"
                                    class="size-4 text-muted flex-shrink-0"
                                />
                            </div>
                        </UCard>
                    </NuxtLink>
                </div>
            </div>
        </template>
    </UDrawer>
</template>
