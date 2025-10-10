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
    { data: pendingReviews, refresh, pending, error } = useApiRequest('/api/pending-reviews', {
        schema: PendingReviewsDto,
        query: queryParams,
        errorMessage: 'Failed to load pending reviews'
    }),
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
    isCollapsed = ref(true),
    toggleCollapsed = () => {
        isCollapsed.value = !isCollapsed.value
    }
</script>

<template>
    <aside
        v-if="hasPendingReviews && visibleReviewsCount > 0"
        role="complementary"
        aria-labelledby="pending-reviews-heading"
        class="bg-gradient-to-r from-warning-50 to-warning-100 border border-warning-200 rounded-lg p-4 mb-6 shadow-sm"
    >
        <!-- Header with toggle -->
        <header class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <UIcon
                    name="i-lucide-bell"
                    class="size-5 text-warning-600"
                />
                <div>
                    <h2
                        id="pending-reviews-heading"
                        class="font-semibold text-warning-800"
                    >
                        Pending Reviews
                    </h2>
                    <p class="text-sm text-warning-700">
                        You have {{ visibleReviewsCount }} requirement{{ visibleReviewsCount === 1 ? '' : 's' }} waiting for your review
                    </p>
                </div>
            </div>

            <nav
                class="flex items-center gap-2"
                aria-label="Review actions"
            >
                <!-- Refresh button -->
                <UButton
                    icon="i-lucide-refresh-cw"
                    color="warning"
                    variant="ghost"
                    size="sm"
                    :loading="pending"
                    :aria-label="pending ? 'Refreshing pending reviews' : 'Refresh pending reviews'"
                    @click="refresh()"
                />

                <!-- Toggle collapse button -->
                <UButton
                    :icon="isCollapsed ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'"
                    color="warning"
                    variant="ghost"
                    size="sm"
                    :aria-label="isCollapsed ? 'Show pending reviews' : 'Hide pending reviews'"
                    :aria-expanded="!isCollapsed"
                    aria-controls="pending-reviews-content"
                    @click="toggleCollapsed"
                />
            </nav>
        </header>

        <!-- Collapsible content -->
        <UCollapsible>
            <template #content>
                <div
                    v-show="!isCollapsed"
                    id="pending-reviews-content"
                    class="mt-4 space-y-3"
                >
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

                    <!-- Reviews for the current solution -->
                    <section
                        class="space-y-2"
                        aria-labelledby="pending-reviews-list-heading"
                    >
                        <h3
                            id="pending-reviews-list-heading"
                            class="sr-only"
                        >
                            Pending reviews for this solution
                        </h3>
                        <ul
                            class="space-y-2"
                            role="list"
                        >
                            <li
                                v-for="review in pendingReviews"
                                :key="review.endorsement.id"
                                class="flex items-center justify-between p-3 bg-white rounded-lg border border-neutral-200 hover:bg-warning-50 transition-colors"
                            >
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 text-sm">
                                        <span class="font-medium text-neutral-900 truncate">
                                            {{ getRequirementDisplayName(review) }}
                                        </span>
                                    </div>
                                    <div class="text-xs text-neutral-600 mt-1">
                                        {{ getEndorsementCategoryDisplay(review) }} endorsement needed
                                    </div>
                                </div>

                                <div class="flex items-center gap-2 ml-3">
                                    <NuxtLink
                                        :to="getReviewLink(review)"
                                        class="inline-flex"
                                        :aria-label="`Review ${getRequirementDisplayName(review)}`"
                                    >
                                        <UButton
                                            color="warning"
                                            variant="solid"
                                            size="sm"
                                            label="Review"
                                            icon="i-lucide-external-link"
                                            trailing
                                        />
                                    </NuxtLink>
                                </div>
                            </li>
                        </ul>
                    </section>
                </div>
            </template>
        </UCollapsible>
    </aside>
</template>
