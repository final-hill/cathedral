<script setup lang="ts">
import { z } from 'zod'
import type * as req from '#shared/domain/requirements'
import type { FormSchema } from '~/components/XForm.vue'
import { WorkflowState } from '#shared/domain/requirements/enums'
import { AppRole } from '#shared/domain/application'
import { workflowColorMap } from '#shared/utils/workflow-colors'
import { getSchemaFields } from '#shared/utils/getSchemaFields'
import { ReviewState, ReviewCategory as ReviewCategoryEnum } from '#shared/domain/endorsement'

const props = defineProps<{
        requirement: req.RequirementType
        schema: FormSchema
        reqType: string
        organizationSlug: string
        solutionSlug: string
        loading?: boolean
    }>(),
    { requirement, schema, reqType, organizationSlug, solutionSlug, loading = false } = toRefs(props),
    { user } = useUserSession(),
    toast = useToast(),
    router = useRouter(),
    processing = ref(false),
    // Permission checks
    userOrgRole = computed(() => {
        if (!user.value) return null
        return user.value.organizationRoles.find(role => role.orgId === organizationSlug.value)
    }),
    isOrgContributor = computed(() =>
        user.value?.isSystemAdmin
        || [AppRole.ORGANIZATION_ADMIN, AppRole.ORGANIZATION_CONTRIBUTOR].includes(userOrgRole.value?.role as AppRole)
    ),
    commonOmitFields = {
        reqId: true,
        reqIdPrefix: true,
        reqType: true,
        createdBy: true,
        creationDate: true,
        lastModified: true,
        id: true,
        isDeleted: true,
        modifiedBy: true,
        solution: true,
        parsedRequirements: true,
        uiBasePathTemplate: true,
        workflowState: true
    } as const,
    displaySchema = computed(() => {
        const rawSchema = schema.value

        // If it's already a FormSchema (processed), return it as-is
        if (!rawSchema || !('omit' in rawSchema) || typeof rawSchema.omit !== 'function')
            return rawSchema as FormSchema

        return (rawSchema as z.ZodObject<z.ZodRawShape>).omit(commonOmitFields) as FormSchema
    }),
    displayFields = computed(() => {
        if (!displaySchema.value) return []
        return getSchemaFields(displaySchema.value)
    }),
    requirementAsRecord = computed(() => requirement.value as Record<string, unknown>),
    getFieldValue = (key: string) => requirementAsRecord.value[key],
    getObjectName = (value: unknown): string => (value as { name: string })?.name || '',
    getBooleanValue = (value: unknown): boolean => value as boolean,
    getDateValue = (value: unknown): Date => value as Date,
    getStringValue = (value: unknown): string => value as string,
    { data: reviewStateData } = useApiRequest(`/api/requirements/${reqType.value}/${requirement.value.id}/review-status`, {
        query: {
            organizationSlug: organizationSlug.value,
            solutionSlug: solutionSlug.value
        },
        schema: ReviewState,
        errorMessage: 'Failed to load review status'
    }),
    reviewState = computed(() => reviewStateData.value ?? null),
    // Group review items by category for display (excluding ENDORSEMENT as it's handled separately)
    // TODO: we need to determine a way to generalize this in the future I think. Otherwise a Custom Component might be needed for each
    reviewCategories = computed(() => {
        if (!reviewState.value?.items) return []

        // Icon mapping for review categories
        const categoryIcons: Record<ReviewCategoryEnum, string> = {
                [ReviewCategoryEnum.ENDORSEMENT]: 'i-lucide-users',
                [ReviewCategoryEnum.CORRECTNESS]: 'i-lucide-check-circle',
                [ReviewCategoryEnum.JUSTIFIABILITY]: 'i-lucide-lightbulb',
                [ReviewCategoryEnum.COMPLETENESS]: 'i-lucide-list-checks',
                [ReviewCategoryEnum.CONSISTENCY]: 'i-lucide-equal',
                [ReviewCategoryEnum.NON_AMBIGUITY]: 'i-lucide-target',
                [ReviewCategoryEnum.FEASIBILITY]: 'i-lucide-gauge',
                [ReviewCategoryEnum.TRACEABILITY]: 'i-lucide-git-branch',
                [ReviewCategoryEnum.VERIFIABILITY]: 'i-lucide-check-circle',
                [ReviewCategoryEnum.ABSTRACTNESS]: 'i-lucide-layers',
                [ReviewCategoryEnum.DELIMITEDNESS]: 'i-lucide-square-dashed-bottom-code',
                [ReviewCategoryEnum.READABILITY]: 'i-lucide-book-open',
                [ReviewCategoryEnum.MODIFIABILITY]: 'i-lucide-edit',
                [ReviewCategoryEnum.PRIORITIZATION]: 'i-lucide-arrow-up'
            },
            itemsByCategory = Object.groupBy(reviewState.value.items, item => item.category)

        // Transform grouped items into category format, excluding ENDORSEMENT category
        return Object.entries(itemsByCategory)
            .filter(([categoryKey]) => categoryKey !== ReviewCategoryEnum.ENDORSEMENT)
            .map(([categoryKey, items]) => {
                const category = categoryKey as ReviewCategoryEnum,
                    firstItem = items?.[0]

                return {
                    name: categoryKey,
                    title: category,
                    description: firstItem?.description || '',
                    icon: categoryIcons[category] || 'i-lucide-check-circle',
                    items: items || []
                }
            })
    }),
    onCancel = () => {
        router.back()
    },
    onReviseRequirement = async () => {
        if (!isOrgContributor.value) {
            toast.add({
                icon: 'i-lucide-alert-triangle',
                title: 'Permission Denied',
                description: 'You do not have permission to revise requirements',
                color: 'error'
            })
            return
        }

        processing.value = true
        try {
            const endpoint = `/api/requirements/${reqType.value}/rejected/${requirement.value.id}/revise`,
                successMessage = 'Requirement revised successfully',
                errorMessage = 'Failed to revise requirement'

            await useApiRequest(endpoint, {
                method: 'POST',
                schema: z.unknown(),
                body: {
                    solutionSlug: solutionSlug.value,
                    organizationSlug: organizationSlug.value
                },
                showSuccessToast: true,
                successMessage,
                errorMessage
            })

            // Navigate back to requirements list
            await navigateTo(`/${organizationSlug.value}/${solutionSlug.value}/requirements`)
        } finally {
            processing.value = false
        }
    }

// Validate that the requirement can be reviewed or is rejected (for revision)
if (requirement.value.workflowState !== WorkflowState.Review && requirement.value.workflowState !== WorkflowState.Rejected) {
    throw createError({
        statusCode: 403,
        statusMessage: `Cannot view requirement in ${requirement.value.workflowState} state. Only requirements in Review or Rejected state can be viewed.`
    })
}
</script>

<template>
    <article class="flex flex-col h-full">
        <!-- Loading State -->
        <section
            v-if="loading"
            class="flex items-center justify-center min-h-96"
            aria-live="polite"
            aria-label="Loading requirement"
        >
            <div class="text-center">
                <UIcon
                    name="i-lucide-loader-2"
                    class="w-8 h-8 animate-spin text-muted mx-auto mb-2"
                />
                <p class="text-muted">
                    Loading requirement...
                </p>
            </div>
        </section>

        <!-- Review Content -->
        <div
            v-else
            class="flex flex-col h-full"
        >
            <!-- Header Section -->
            <header class="pb-4 border-b border-default">
                <div class="flex items-center gap-3 mb-2">
                    <h1 class="text-2xl font-bold text-highlighted">
                        {{ requirement.name }}
                    </h1>
                    <UBadge
                        :color="workflowColorMap[requirement.workflowState as keyof typeof workflowColorMap]"
                        variant="subtle"
                        size="md"
                    >
                        {{ requirement.workflowState }}
                    </UBadge>
                </div>
                <p
                    v-if="requirement.description"
                    class="text-muted"
                >
                    {{ requirement.description }}
                </p>
            </header>

            <!-- Content Section -->
            <section class="flex-1 py-6 overflow-hidden">
                <div class="flex gap-6 h-full">
                    <!-- Left Column - Requirement Details -->
                    <div class="w-1/2 space-y-6 overflow-y-auto pr-3">
                        <h2 class="text-lg font-semibold text-highlighted border-b border-default pb-2">
                            Requirement Details
                        </h2>
                        <dl
                            v-for="field in displayFields"
                            :key="field.key"
                            class="space-y-2"
                        >
                            <dt class="text-sm font-medium text-toned">
                                {{ field.label }}
                            </dt>

                            <!-- Custom field slot - allows parent to provide custom display -->
                            <dd v-if="$slots[`field-${field.key}`]">
                                <slot
                                    :name="`field-${field.key}`"
                                    :field="field"
                                    :model-value="getFieldValue(field.key)"
                                    :field-key="field.key"
                                />
                            </dd>
                            <!-- Default rendering based on field type -->
                            <dd v-else-if="field.isObject && getObjectName(getFieldValue(field.key))">
                                <UBadge
                                    :label="getObjectName(getFieldValue(field.key))"
                                    color="info"
                                    variant="soft"
                                />
                            </dd>
                            <dd v-else-if="field.innerType instanceof z.ZodBoolean">
                                <UCheckbox
                                    :model-value="getBooleanValue(getFieldValue(field.key))"
                                    disabled
                                />
                            </dd>
                            <dd v-else-if="field.innerType instanceof z.ZodDate">
                                <time :datetime="getDateValue(getFieldValue(field.key)).toISOString()">
                                    {{ getDateValue(getFieldValue(field.key)).toLocaleString() }}
                                </time>
                            </dd>
                            <dd v-else-if="field.isEnum">
                                <UBadge
                                    :label="getStringValue(getFieldValue(field.key))"
                                    color="neutral"
                                    variant="soft"
                                />
                            </dd>
                            <dd v-else-if="field.isArray">
                                <div class="space-y-2">
                                    <div
                                        v-for="(item, index) in (getFieldValue(field.key) as Array<unknown> || [])"
                                        :key="index"
                                        class="p-3 bg-muted rounded-lg text-sm text-default"
                                    >
                                        {{ typeof item === 'object' ? JSON.stringify(item) : item }}
                                    </div>
                                    <div
                                        v-if="!(getFieldValue(field.key) as Array<unknown>)?.length"
                                        class="text-muted italic text-sm"
                                    >
                                        No items
                                    </div>
                                </div>
                            </dd>
                            <dd v-else>
                                <!-- Default display for field values -->
                                <p class="text-muted">
                                    {{ getFieldValue(field.key) }}
                                </p>
                            </dd>
                        </dl>
                    </div>

                    <!-- Right Column - Review Categories -->
                    <aside class="w-1/2 border-l border-default pl-3 overflow-y-auto">
                        <h2 class="text-lg font-semibold text-highlighted border-b border-default pb-2 mb-4">
                            Review Checklist
                        </h2>

                        <!-- Review Categories -->
                        <div class="space-y-4">
                            <template v-if="reviewState && reviewCategories.length > 0">
                                <ReviewCategory
                                    v-for="category in reviewCategories"
                                    :key="category.name"
                                    :review-state="{ overall: reviewState.overall, items: category.items }"
                                    :category-name="category.name"
                                    :category-title="category.title"
                                    :category-description="category.description"
                                    :category-icon="category.icon"
                                />
                            </template>
                            <div
                                v-else-if="!reviewState"
                                class="flex items-center justify-center p-6"
                            >
                                <UIcon
                                    name="i-lucide-loader-2"
                                    class="w-5 h-5 animate-spin text-muted"
                                />
                                <span class="ml-2 text-sm text-muted">Loading review status...</span>
                            </div>
                            <div
                                v-else
                                class="p-6 text-center text-muted"
                            >
                                <p>No review items available.</p>
                            </div>

                            <!-- Endorsements - Stays as custom workflow component -->
                            <ReviewEndorsements
                                v-if="reviewState"
                                :requirement-id="requirement.id"
                                :req-type="reqType"
                                :organization-slug="organizationSlug"
                                :solution-slug="solutionSlug"
                            />
                        </div>
                    </aside>
                </div>
            </section>

            <!-- Actions Section -->
            <footer class="pt-4 border-t border-default">
                <nav class="flex justify-between gap-3">
                    <UButton
                        variant="ghost"
                        color="neutral"
                        :loading="loading || processing"
                        @click="onCancel"
                    >
                        Back
                    </UButton>

                    <div class="flex gap-3">
                        <!-- Revise Button - when requirement is rejected -->
                        <UButton
                            v-if="isOrgContributor && requirement.workflowState === WorkflowState.Rejected"
                            color="primary"
                            icon="i-lucide-edit"
                            :loading="processing"
                            :disabled="loading"
                            @click="onReviseRequirement"
                        >
                            Revise
                        </UButton>

                        <!-- Status display for review requirements -->
                        <UButton
                            v-else-if="requirement.workflowState === WorkflowState.Review"
                            color="neutral"
                            variant="ghost"
                            icon="i-lucide-eye"
                            disabled
                        >
                            Review In Progress
                        </UButton>
                    </div>
                </nav>
            </footer>
        </div>
    </article>
</template>
