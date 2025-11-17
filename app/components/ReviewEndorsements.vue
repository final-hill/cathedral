<script setup lang="ts">
import type { EndorsementType } from '#shared/domain/endorsement'
import { EndorsementStatus, ReviewStatus, Endorsement } from '#shared/domain/endorsement'
import { Person, ReqType } from '#shared/domain'
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { ReviewComponentInterface } from '~/types'

const endorsementSchema = z.object({
        comments: z.string().optional()
    }),
    rejectionSchema = z.object({
        reason: z.string().min(1, 'Reason for rejection is required')
    })

type EndorsementForm = z.output<typeof endorsementSchema>
type RejectionForm = z.output<typeof rejectionSchema>

const props = defineProps<{
        requirementId: string
        reqType: string
        organizationSlug: string
        solutionSlug: string
    }>(),
    toast = useToast(),
    { user } = useUserSession(),
    router = useRouter(),
    url = computed(() => `/api/requirements/${props.reqType}/${props.requirementId}/endorsements`),
    query = computed(() => ({
        organizationSlug: props.organizationSlug,
        solutionSlug: props.solutionSlug
    })),
    { data: endorsements, refresh } = useApiRequest({ url, options: {
        query,
        schema: z.array(Endorsement),
        errorMessage: 'Failed to load endorsements'
    } }),
    // State for action operations
    isEndorsing = ref(false),
    isRejecting = ref(false),
    /**
     * Check requirement workflow state and redirect if no longer in Review
     */
    checkWorkflowStateAndRedirect = async () => {
        const { data: requirement } = await useApiRequest({ url: `/api/requirements/${props.reqType}/${props.requirementId}`, options: {
            query: {
                solutionSlug: props.solutionSlug,
                organizationSlug: props.organizationSlug
            },
            schema: z.object({
                workflowState: z.string(),
                name: z.string(),
                reqType: z.string()
            }),
            // Disable caching to ensure we get the latest workflow state after endorsement
            getCachedData: () => undefined
        } })

        if (requirement.value && requirement.value.workflowState !== 'Review') {
            // Show appropriate message based on the new workflow state
            if (requirement.value.workflowState === 'Active') {
                toast.add({
                    icon: 'i-lucide-check-circle',
                    title: 'Requirement Approved',
                    description: `${requirement.value.name} has been automatically approved and is now Active`,
                    color: 'success'
                })
            } else if (requirement.value.workflowState === 'Rejected') {
                toast.add({
                    icon: 'i-lucide-x-circle',
                    title: 'Requirement Rejected',
                    description: `${requirement.value.name} has been rejected due to endorsement feedback`,
                    color: 'error'
                })
            } else {
                toast.add({
                    icon: 'i-lucide-info',
                    title: 'Workflow Updated',
                    description: `${requirement.value.name} is now in ${requirement.value.workflowState} state`,
                    color: 'info'
                })
            }

            // Redirect to the requirement view page (remove /review from URL)
            const currentPath = router.currentRoute.value.path,
                viewPath = currentPath.replace('/review', '')
            await router.push(viewPath)
        }
    },
    /**
     * Endorse the requirement
     */
    endorse = async (options: { comments?: string } = {}) => {
        if (isEndorsing.value) return

        isEndorsing.value = true
        try {
            const endorseUrl = `/api/requirements/${props.reqType}/${props.requirementId}/endorse`

            await useApiRequest({ url: endorseUrl, options: {
                method: 'POST',
                body: {
                    solutionSlug: props.solutionSlug,
                    organizationSlug: props.organizationSlug,
                    comments: options.comments
                },
                schema: z.unknown(),
                showSuccessToast: true,
                successMessage: 'Requirement endorsed successfully',
                errorMessage: 'Failed to endorse requirement'
            } })

            await refresh()

            await checkWorkflowStateAndRedirect()
        } finally {
            isEndorsing.value = false
        }
    },
    /**
     * Reject the requirement endorsement
     */
    reject = async (options: { reason: string }) => {
        if (isRejecting.value) return

        isRejecting.value = true
        try {
            const rejectUrl = `/api/requirements/${props.reqType}/${props.requirementId}/reject-endorsement`

            await useApiRequest({ url: rejectUrl, options: {
                method: 'POST',
                body: {
                    solutionSlug: props.solutionSlug,
                    organizationSlug: props.organizationSlug,
                    reason: options.reason
                },
                schema: z.unknown(),
                showSuccessToast: true,
                successMessage: 'Endorsement rejected successfully',
                errorMessage: 'Failed to reject endorsement'
            } })

            await refresh()

            await checkWorkflowStateAndRedirect()
        } finally {
            isRejecting.value = false
        }
    }

// Expose interface for parent component
defineExpose<ReviewComponentInterface>({
    status: computed(() => endorsementStatus.value)
})

// Compute endorsement status for color coding
const endorsementStatus = computed(() => {
        const allEndorsements = endorsements.value || []
        if (allEndorsements.length === 0) return ReviewStatus.NONE

        const rejectedEndorsements = allEndorsements.filter(e => e.status === EndorsementStatus.REJECTED)
        if (rejectedEndorsements.length > 0) return ReviewStatus.REJECTED

        const approvedEndorsements = allEndorsements.filter(e => e.status === EndorsementStatus.APPROVED),
            pendingEndorsements = allEndorsements.filter(e => e.status === EndorsementStatus.PENDING)

        if (pendingEndorsements.length === 0) return ReviewStatus.APPROVED
        if (approvedEndorsements.length > 0) return ReviewStatus.PARTIAL
        return ReviewStatus.PENDING
    }),
    endorsementColors = {
        [ReviewStatus.NONE]: 'text-neutral',
        [ReviewStatus.PENDING]: 'text-warning',
        [ReviewStatus.PARTIAL]: 'text-info',
        [ReviewStatus.APPROVED]: 'text-success',
        [ReviewStatus.REJECTED]: 'text-error'
    },
    // Fetch person matching current user's appUserId for authorization checks only
    { data: userPersonList } = await useApiRequest({ url: `/api/requirements/${ReqType.PERSON}`, options: {
        schema: z.array(Person),
        query: {
            solutionSlug: props.solutionSlug,
            organizationSlug: props.organizationSlug,
            appUser: user.value?.id
        }
    } }),
    userPerson = computed(() => userPersonList.value?.[0]),
    // Filter endorsements to show only role-based ones (not automated checks)
    roleBasedEndorsements = computed(() => {
        if (!endorsements.value) return []
        // Role-based endorsements have an endorsedBy person
        return endorsements.value.filter(e => e.endorsedBy !== null && e.endorsedBy !== undefined)
    }),
    endorsementProcessing = ref<string | null>(null),
    showEndorsementDialog = ref(false),
    currentEndorsement = ref<EndorsementType | null>(null),
    isRejectMode = ref(false),
    endorsementFormState = reactive<EndorsementForm>({
        comments: ''
    }),
    rejectionFormState = reactive<RejectionForm>({
        reason: ''
    }),
    endorsementBadgeMap = new Map([
        [EndorsementStatus.PENDING, { color: 'warning' as const, label: camelCaseToTitleCase(EndorsementStatus.PENDING) }],
        [EndorsementStatus.APPROVED, { color: 'success' as const, label: camelCaseToTitleCase(EndorsementStatus.APPROVED) }],
        [EndorsementStatus.REJECTED, { color: 'error' as const, label: camelCaseToTitleCase(EndorsementStatus.REJECTED) }]
    ]),
    getEndorsementBadge = (status: EndorsementStatus) =>
        endorsementBadgeMap.get(status) ?? { color: 'neutral' as const, label: status },
    canEndorseSpecific = (endorsement: EndorsementType) => {
        if (endorsement.status !== EndorsementStatus.PENDING) return false
        if (!user.value?.id || !userPerson.value) return false

        // Get current user's person entity
        const currentUserPerson = userPerson.value
        if (!currentUserPerson) return false

        // Automated checks have no endorsedBy, so they can't be manually endorsed
        if (!endorsement.endorsedBy) return false

        // Check if this endorsement is assigned to the current user's person
        if (endorsement.endorsedBy.id !== currentUserPerson.id) return false

        // Check if person has any endorsement capabilities
        const canEndorse = currentUserPerson.isProductOwner || currentUserPerson.isImplementationOwner
            || currentUserPerson.canEndorseProjectRequirements || currentUserPerson.canEndorseEnvironmentRequirements
            || currentUserPerson.canEndorseGoalsRequirements || currentUserPerson.canEndorseSystemRequirements

        return canEndorse
    },
    onEndorseFormSubmit = async (event: FormSubmitEvent<EndorsementForm>) => {
        if (!currentEndorsement.value) return
        await onEndorse(event.data.comments)
        showEndorsementDialog.value = false
    },
    onRejectFormSubmit = async (event: FormSubmitEvent<RejectionForm>) => {
        if (!currentEndorsement.value) return
        await onRejectEndorsement(event.data.reason)
        showEndorsementDialog.value = false
    },
    onEndorse = async (comments?: string) => {
        await endorse({ comments: comments || '' })
        endorsementFormState.comments = ''
    },
    onRejectEndorsement = async (reason?: string) => {
        const rejectionReason = reason || rejectionFormState.reason

        if (!rejectionReason.trim()) {
            toast.add({
                icon: 'i-lucide-alert-triangle',
                title: 'Reason Required',
                description: 'Please provide a reason for rejection',
                color: 'warning'
            })
            return
        }

        await reject({ reason: rejectionReason })
        rejectionFormState.reason = ''
        showEndorsementDialog.value = false
    },
    openRejectDialog = (endorsement: EndorsementType) => {
        currentEndorsement.value = endorsement
        rejectionFormState.reason = ''
        isRejectMode.value = true
        showEndorsementDialog.value = true
    },
    openEndorseDialog = (endorsement: EndorsementType) => {
        currentEndorsement.value = endorsement
        endorsementFormState.comments = ''
        isRejectMode.value = false
        showEndorsementDialog.value = true
    }
</script>

<template>
    <UCollapsible class="flex flex-col gap-2">
        <UButton
            class="group justify-between"
            :class="endorsementColors[endorsementStatus]"
            label="Endorsements"
            color="neutral"
            variant="ghost"
            leading-icon="i-lucide-thumbs-up"
            trailing-icon="i-lucide-chevron-down"
            :ui="{
                trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
            }"
            block
        />
        <template #content>
            <div class="space-y-4 p-4 border border-default rounded-lg bg-muted/20">
                <p class="text-sm text-muted">
                    A requirement is endorsed if it has been approved by relevant Key Stakeholders
                </p>

                <section aria-labelledby="endorsements-heading">
                    <h2
                        id="endorsements-heading"
                        class="sr-only"
                    >
                        Requirement Endorsements
                    </h2>

                    <!-- No Person Entity Warning -->
                    <section
                        v-if="!userPerson"
                        class="p-4 border border-warning/50 bg-warning/5 rounded-lg"
                        role="alert"
                        aria-labelledby="no-person-title"
                    >
                        <div class="flex items-start gap-3">
                            <UIcon
                                name="i-lucide-alert-triangle"
                                class="w-5 h-5 text-warning flex-shrink-0 mt-0.5"
                                aria-hidden="true"
                            />
                            <div class="flex-1">
                                <h3
                                    id="no-person-title"
                                    class="font-medium text-warning"
                                >
                                    No Person Entity Found
                                </h3>
                                <p class="text-sm text-warning/80 mt-1">
                                    No Person entity found linked to your user account in this solution.
                                    Please contact your organization administrator to set up your Person entity
                                    with the required endorsement capabilities.
                                </p>
                            </div>
                        </div>
                    </section>

                    <!-- Endorsements Content -->
                    <section
                        v-if="roleBasedEndorsements.length > 0"
                        aria-label="List of endorsements"
                        class="space-y-3"
                    >
                        <article
                            v-for="endorsement in roleBasedEndorsements"
                            :key="endorsement.id"
                            :aria-labelledby="`endorsement-${endorsement.id}-title`"
                            class="flex items-center justify-between p-3 border border-default rounded-lg"
                        >
                            <div class="flex-1">
                                <header class="flex items-center gap-2 mb-1">
                                    <h3
                                        :id="`endorsement-${endorsement.id}-title`"
                                        class="font-medium text-highlighted"
                                    >
                                        {{ endorsement.endorsedBy?.name ?? 'System' }}
                                    </h3>
                                    <UBadge
                                        :color="getEndorsementBadge(endorsement.status).color"
                                        variant="soft"
                                        size="sm"
                                        :aria-label="`Status: ${getEndorsementBadge(endorsement.status).label}`"
                                    >
                                        {{ getEndorsementBadge(endorsement.status).label }}
                                    </UBadge>
                                </header>

                                <!-- Endorsement Details -->
                                <p
                                    v-if="endorsement.status !== EndorsementStatus.PENDING && (endorsement.endorsedAt || endorsement.rejectedAt)"
                                    class="text-xs text-muted"
                                >
                                    <time :datetime="(endorsement.endorsedAt || endorsement.rejectedAt)?.toISOString()">
                                        {{ camelCaseToTitleCase(endorsement.status) }} by
                                        {{ endorsement.endorsedBy?.name ?? 'System' }}
                                        on {{ new Date(endorsement.endorsedAt || endorsement.rejectedAt!).toLocaleDateString() }}
                                    </time>
                                </p>

                                <!-- Comments -->
                                <blockquote
                                    v-if="endorsement.comments"
                                    class="text-xs text-toned mt-1 italic"
                                >
                                    "{{ endorsement.comments }}"
                                </blockquote>
                            </div>

                            <!-- Action Buttons for Pending Endorsements -->
                            <nav
                                v-if="endorsement.status === EndorsementStatus.PENDING && canEndorseSpecific(endorsement)"
                                class="flex gap-2"
                                :aria-label="`Actions for ${endorsement.endorsedBy?.name ?? 'System'} endorsement`"
                            >
                                <UButton
                                    size="xs"
                                    color="success"
                                    variant="outline"
                                    icon="i-lucide-thumbs-up"
                                    :loading="isEndorsing && endorsementProcessing === endorsement.id"
                                    :aria-label="`Endorse requirement for ${endorsement.endorsedBy?.name ?? 'System'}`"
                                    @click="openEndorseDialog(endorsement)"
                                >
                                    Endorse
                                </UButton>
                                <UButton
                                    size="xs"
                                    color="error"
                                    variant="outline"
                                    icon="i-lucide-thumbs-down"
                                    :loading="isRejecting && endorsementProcessing === endorsement.id"
                                    :aria-label="`Reject requirement for ${endorsement.endorsedBy?.name ?? 'System'}`"
                                    @click="openRejectDialog(endorsement)"
                                >
                                    Reject
                                </UButton>
                            </nav>
                        </article>
                    </section>

                    <!-- No Endorsements Required -->
                    <p
                        v-else
                        class="text-sm text-muted italic"
                        role="status"
                    >
                        No endorsements are required for this requirement.
                    </p>
                </section>
            </div>
        </template>
    </UCollapsible>

    <!-- Endorsement Dialog -->
    <UModal
        v-model:open="showEndorsementDialog"
        :title="isRejectMode ? 'Reject Endorsement' : 'Endorse Requirement'"
        role="dialog"
        :aria-describedby="isRejectMode ? 'reject-dialog-description' : 'endorse-dialog-description'"
    >
        <template #body>
            <UForm
                v-if="!isRejectMode"
                id="endorsement-form"
                :schema="endorsementSchema"
                :state="endorsementFormState"
                class="space-y-4"
                @submit="onEndorseFormSubmit"
            >
                <p
                    id="endorse-dialog-description"
                    class="text-sm text-muted"
                >
                    You are endorsing the requirement for:
                    <strong>{{ currentEndorsement?.endorsedBy?.name ?? 'System' }}</strong>
                </p>

                <UFormField
                    label="Comments (Optional)"
                    name="comments"
                >
                    <UTextarea
                        v-model="endorsementFormState.comments"
                        placeholder="Optional comments for your endorsement..."
                        :rows="3"
                        class="w-full"
                        aria-describedby="endorsement-comments-help"
                    />
                </UFormField>

                <aside
                    id="endorsement-comments-help"
                    class="text-xs text-success"
                    role="note"
                    aria-live="polite"
                >
                    <UIcon
                        name="i-lucide-thumbs-up"
                        class="w-3 h-3"
                        aria-hidden="true"
                    />
                    Endorsing this requirement indicates your approval.
                </aside>
            </UForm>

            <UForm
                v-else
                id="rejection-form"
                :schema="rejectionSchema"
                :state="rejectionFormState"
                class="space-y-4"
                @submit="onRejectFormSubmit"
            >
                <p
                    id="reject-dialog-description"
                    class="text-sm text-muted"
                >
                    You are rejecting the endorsement for:
                    <strong>{{ currentEndorsement?.endorsedBy?.name ?? 'System' }}</strong>
                </p>

                <UFormField
                    label="Reason for Rejection"
                    name="reason"
                    required
                >
                    <UTextarea
                        v-model="rejectionFormState.reason"
                        placeholder="Please provide a detailed reason for rejecting this requirement..."
                        :rows="4"
                        class="w-full"
                        aria-describedby="rejection-reason-help"
                    />
                </UFormField>

                <aside
                    id="rejection-reason-help"
                    class="text-xs text-warning"
                    role="note"
                    aria-live="polite"
                >
                    <UIcon
                        name="i-lucide-alert-triangle"
                        class="w-3 h-3"
                        aria-hidden="true"
                    />
                    Rejecting this endorsement will move the requirement to Rejected state.
                </aside>
            </UForm>
        </template>

        <template #footer>
            <nav
                class="flex justify-end gap-2"
                aria-label="Dialog actions"
            >
                <UButton
                    variant="ghost"
                    color="neutral"
                    type="button"
                    @click="showEndorsementDialog = false"
                >
                    Cancel
                </UButton>
                <UButton
                    v-if="!isRejectMode"
                    color="success"
                    type="submit"
                    form="endorsement-form"
                    :loading="isEndorsing && endorsementProcessing === currentEndorsement?.id"
                >
                    Endorse Requirement
                </UButton>
                <UButton
                    v-else
                    color="error"
                    type="submit"
                    form="rejection-form"
                    :loading="isRejecting && endorsementProcessing === currentEndorsement?.id"
                    :disabled="!rejectionFormState.reason.trim()"
                >
                    Reject Endorsement
                </UButton>
            </nav>
        </template>
    </UModal>
</template>
