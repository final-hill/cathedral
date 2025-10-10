<script setup lang="ts">
import { ReviewStatus } from '#shared/domain/endorsement'
import type { ReviewStateType } from '#shared/domain/endorsement'
import type { ReviewComponentInterface } from '~/types'

interface Props {
    reviewState: ReviewStateType
    categoryName: string
    categoryTitle: string
    categoryDescription: string
    categoryIcon?: string
    /** Optional click handler for review action buttons */
    onReviewAction?: (itemId: string) => void
    /** Custom action button text */
    actionButtonText?: string
    /** Whether to show action buttons for pending items */
    showActionButtons?: boolean
}

const props = withDefaults(defineProps<Props>(), {
        categoryIcon: 'i-lucide-check-circle',
        actionButtonText: 'Review',
        showActionButtons: false
    }),
    items = computed(() => {
        if (!props.reviewState?.items) return []

        return props.reviewState.items
    }),
    completedCount = computed(() => {
        return items.value.filter(item =>
            item.status === ReviewStatus.APPROVED || item.status === ReviewStatus.REJECTED
        ).length
    }),
    totalCount = computed(() => items.value.length),
    canReview = computed(() => {
        return items.value.some(item => item.canUserReview)
    }),
    hasRequiredItems = computed(() => {
        return items.value.some(item => item.isRequired)
    }),
    isComplete = computed(() => {
        const categoryItems = items.value
        if (categoryItems.length === 0) return true // No items means complete

        const completed = completedCount.value
        return completed === categoryItems.length
    }),
    status = computed(() => {
        const categoryItems = items.value

        if (categoryItems.length === 0) return ReviewStatus.NONE

        if (categoryItems.every(item => item.status === ReviewStatus.APPROVED))
            return ReviewStatus.APPROVED
        else if (categoryItems.some(item => item.status === ReviewStatus.REJECTED))
            return ReviewStatus.REJECTED
        else if (categoryItems.some(item => item.status === ReviewStatus.APPROVED))
            return ReviewStatus.PARTIAL
        else
            return ReviewStatus.PENDING
    }),
    pendingUserItems = computed(() => {
        return items.value.filter(item =>
            item.status === ReviewStatus.PENDING && item.canUserReview
        )
    }),
    blockedItems = computed(() => {
        return items.value.filter(item => item.status === ReviewStatus.REJECTED)
    })

// Expose interface for parent component
defineExpose<ReviewComponentInterface>({
    status: readonly(status)
})
</script>

<template>
    <UCollapsible class="flex flex-col gap-2">
        <UButton
            class="group justify-between"
            :class="{
                'text-warning': status === ReviewStatus.PENDING,
                'text-success': status === ReviewStatus.APPROVED,
                'text-error': status === ReviewStatus.REJECTED,
                'text-info': status === ReviewStatus.PARTIAL
            }"
            :label="`${categoryTitle}${totalCount > 0 ? ` (${completedCount}/${totalCount})` : ''}${isComplete ? ' ✓' : ''}${hasRequiredItems ? ' *' : ''}`"
            :color="status === ReviewStatus.APPROVED ? 'success' : 'neutral'"
            :variant="status === ReviewStatus.APPROVED ? 'soft' : 'ghost'"
            :leading-icon="categoryIcon"
            trailing-icon="i-lucide-chevron-down"
            :ui="{
                trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
            }"
            block
        />
        <template #content>
            <div class="space-y-3 p-4 border border-default rounded-lg bg-elevated">
                <div class="flex items-center justify-between">
                    <p class="text-sm text-highlighted font-medium">
                        {{ categoryDescription }}
                    </p>
                    <div class="flex items-center gap-2">
                        <UBadge
                            v-if="isComplete"
                            color="success"
                            variant="soft"
                            size="xs"
                        >
                            Complete
                        </UBadge>
                        <UBadge
                            v-if="hasRequiredItems"
                            color="warning"
                            variant="soft"
                            size="xs"
                        >
                            Required
                        </UBadge>
                        <UBadge
                            v-if="canReview"
                            color="primary"
                            variant="soft"
                            size="xs"
                        >
                            Can Review
                        </UBadge>
                    </div>
                </div>

                <!-- Show review items when available from server -->
                <div
                    v-if="items.length > 0"
                    class="space-y-2"
                >
                    <div
                        v-for="item in items"
                        :key="item.id"
                        class="flex items-center justify-between p-3 border rounded-lg"
                        :class="{
                            'border-success bg-success/10': item.status === ReviewStatus.APPROVED,
                            'border-error bg-error/10': item.status === ReviewStatus.REJECTED,
                            'border-default bg-muted': item.status === ReviewStatus.PENDING || item.status === ReviewStatus.PARTIAL
                        }"
                    >
                        <div class="flex-1">
                            <h4 class="font-semibold text-sm text-highlighted">
                                {{ item.title }}
                            </h4>
                            <p
                                v-if="item.description"
                                class="text-xs text-toned"
                            >
                                {{ item.description }}
                            </p>
                            <div class="flex items-center gap-2 mt-1">
                                <UBadge
                                    v-if="item.isRequired"
                                    color="error"
                                    variant="soft"
                                    size="xs"
                                >
                                    Required
                                </UBadge>
                                <UBadge
                                    v-if="item.canUserReview"
                                    color="primary"
                                    variant="soft"
                                    size="xs"
                                >
                                    Manual Review
                                </UBadge>
                                <UBadge
                                    v-else
                                    color="neutral"
                                    variant="soft"
                                    size="xs"
                                >
                                    Automated
                                </UBadge>
                            </div>
                        </div>
                        <UBadge
                            :color="item.status === ReviewStatus.APPROVED ? 'success'
                                : item.status === ReviewStatus.REJECTED ? 'error'
                                    : item.status === ReviewStatus.PARTIAL ? 'info' : 'warning'"
                            variant="soft"
                            size="sm"
                        >
                            {{ item.status }}
                        </UBadge>
                    </div>

                    <!-- Show pending items that need user attention -->
                    <div
                        v-if="pendingUserItems.length > 0 && canReview"
                        class="border-t border-default pt-3"
                    >
                        <p class="text-sm font-medium text-primary mb-2">
                            Action Required
                        </p>
                        <div class="space-y-2">
                            <div
                                v-for="item in pendingUserItems"
                                :key="`pending-${item.id}`"
                                class="flex items-center justify-between p-2 bg-primary/10 border border-primary/20 rounded-lg"
                            >
                                <span class="text-sm font-medium text-highlighted">{{ item.title }}</span>
                                <UButton
                                    v-if="props.showActionButtons && props.onReviewAction"
                                    size="xs"
                                    color="primary"
                                    variant="soft"
                                    @click="props.onReviewAction(item.id)"
                                >
                                    {{ props.actionButtonText }}
                                </UButton>
                                <UButton
                                    v-else-if="props.showActionButtons"
                                    size="xs"
                                    color="primary"
                                    variant="soft"
                                    disabled
                                >
                                    {{ props.actionButtonText }}
                                </UButton>
                            </div>
                        </div>
                    </div>

                    <!-- Show message when user can't review -->
                    <div
                        v-else-if="pendingUserItems.length > 0 && !canReview"
                        class="border-t border-default pt-3"
                    >
                        <p class="text-sm text-toned italic">
                            {{ pendingUserItems.length }} item(s) pending review by authorized users
                        </p>
                    </div>

                    <!-- Show blocked items that need attention -->
                    <div
                        v-if="blockedItems.length > 0"
                        class="border-t border-default pt-3"
                    >
                        <p class="text-sm font-medium text-error mb-2">
                            Issues Found
                        </p>
                        <div class="space-y-2">
                            <div
                                v-for="item in blockedItems"
                                :key="`blocked-${item.id}`"
                                class="flex items-center justify-between p-2 bg-error/10 border border-error/20 rounded-lg"
                            >
                                <span class="text-sm font-medium text-highlighted">{{ item.title }}</span>
                                <UBadge
                                    color="error"
                                    variant="soft"
                                    size="sm"
                                >
                                    Rejected
                                </UBadge>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Loading state -->
                <div
                    v-else-if="!props.reviewState"
                    class="flex items-center justify-center p-6"
                >
                    <UIcon
                        name="i-lucide-loader-2"
                        class="w-5 h-5 animate-spin text-toned"
                    />
                    <span class="ml-2 text-sm text-toned">Loading {{ categoryTitle.toLowerCase() }} checks...</span>
                </div>

                <!-- No items state -->
                <div
                    v-else
                    class="flex items-center justify-between p-3 border border-default rounded-lg"
                >
                    <div class="flex-1">
                        <h4 class="font-semibold text-sm text-highlighted">
                            {{ categoryTitle }} Review
                        </h4>
                        <p class="text-xs text-toned">
                            No specific {{ categoryTitle.toLowerCase() }} checks configured
                        </p>
                    </div>
                    <UBadge
                        color="neutral"
                        variant="soft"
                        size="sm"
                    >
                        {{ status }}
                    </UBadge>
                </div>
            </div>
        </template>
    </UCollapsible>
</template>
