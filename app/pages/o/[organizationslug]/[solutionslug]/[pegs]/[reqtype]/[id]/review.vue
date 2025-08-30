<script lang="ts" setup>
import { ReqType, WorkflowState } from '#shared/domain'
import * as req from '#shared/domain/requirements'
import type { RequirementType } from '~~/shared/domain'
import { z } from 'zod'
import type { ZodRawShape } from 'zod'

const route = useRoute(),
    router = useRouter(),
    toast = useToast(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug, reqtype: reqType, id } = route.params as {
        solutionslug: string
        organizationslug: string
        reqtype: string
        id: string
    },
    // Convert reqType to ReqType enum value (e.g., 'assumption' -> 'ASSUMPTION', 'glossary-term' -> 'GLOSSARY_TERM')
    reqTypeSnakeCase = slugToSnakeCase(reqType),
    reqTypeValue = reqTypeSnakeCase.toUpperCase() as keyof typeof ReqType,
    actualReqType = ReqType[reqTypeValue]

if (!actualReqType) {
    throw createError({
        statusCode: 404,
        statusMessage: `Unknown requirement type: ${reqType}`
    })
}

const ReqTypePascal = snakeCaseToPascalCase(actualReqType) as keyof typeof req,
    RequirementSchema = req[ReqTypePascal]

if (!RequirementSchema) {
    throw createError({
        statusCode: 404,
        statusMessage: `Requirement entity not found for: ${reqType}`
    })
}

const title = `Review ${snakeCaseToPascalCase(reqType)}`

useHead({ title })
definePageMeta({ middleware: 'auth' })

const { data: requirement, status, error } = await useFetch<RequirementType>(`/api/requirements/${actualReqType}/${id}`, {
    query: { solutionSlug, organizationSlug },
    transform: (data: unknown) => transformRequirementDates(
        data as { creationDate: string, lastModified: string }
    ) as unknown as RequirementType
})

if (error.value) {
    throw createError({
        statusCode: 404,
        statusMessage: `${snakeCaseToPascalCase(reqType)} not found`
    })
}

// Validate that the requirement is in Review state
if (requirement.value && requirement.value.workflowState !== WorkflowState.Review) {
    throw createError({
        statusCode: 403,
        statusMessage: `Cannot review requirement in ${requirement.value.workflowState} state. Only requirements in Review state can be reviewed.`
    })
}

const innerSchema = RequirementSchema instanceof z.ZodEffects
        ? RequirementSchema.innerType()
        : RequirementSchema,
    viewSchema = (innerSchema as z.ZodObject<ZodRawShape>).omit({
        reqType: true,
        createdBy: true,
        creationDate: true,
        lastModified: true,
        id: true,
        isDeleted: true,
        modifiedBy: true,
        solution: true,
        parsedRequirements: true
    }),
    isLoading = computed(() => status.value === 'pending'),
    isProcessing = ref(false),
    onApprove = async () => {
        if (!requirement.value) return

        isProcessing.value = true
        try {
            await $fetch(`/api/requirements/${actualReqType}/review/${requirement.value.id}/approve`, {
                method: 'POST',
                body: {
                    solutionSlug,
                    organizationSlug
                }
            })

            toast.add({
                icon: 'i-lucide-check',
                title: 'Success',
                description: 'Requirement approved successfully'
            })

            router.back()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error)
            toast.add({
                icon: 'i-lucide-alert-circle',
                title: 'Error',
                description: `Error approving requirement: ${message}`,
                color: 'error'
            })
        } finally {
            isProcessing.value = false
        }
    },
    onReject = async () => {
        if (!requirement.value) return

        isProcessing.value = true
        try {
            await $fetch(`/api/requirements/${actualReqType}/review/${requirement.value.id}/reject`, {
                method: 'POST',
                body: {
                    solutionSlug,
                    organizationSlug
                }
            })

            toast.add({
                icon: 'i-lucide-check',
                title: 'Success',
                description: 'Requirement rejected'
            })

            router.back()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error)
            toast.add({
                icon: 'i-lucide-alert-circle',
                title: 'Error',
                description: `Error rejecting requirement: ${message}`,
                color: 'error'
            })
        } finally {
            isProcessing.value = false
        }
    },
    onCancel = () => { router.back() },
    dummySubmit = async () => {},
    dummyCancel = () => {}
</script>

<template>
    <div class="review-requirement">
        <!-- Loading State -->
        <div
            v-if="isLoading"
            class="flex items-center justify-center min-h-96"
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
        </div>

        <!-- Review Content -->
        <UCard v-else-if="requirement">
            <template #header>
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <h1 class="text-2xl font-bold text-highlighted mb-2">
                            {{ title }}
                        </h1>
                        <div class="flex items-center gap-3">
                            <UBadge
                                label="Review"
                                color="warning"
                            />
                        </div>
                    </div>
                    <UButton
                        color="neutral"
                        variant="ghost"
                        icon="i-lucide-x"
                        @click="onCancel"
                    />
                </div>
            </template>

            <div class="space-y-6">
                <div class="bg-info/10 border border-info/20 rounded-lg p-4">
                    <div class="flex items-start space-x-3">
                        <UIcon
                            name="i-lucide-info"
                            class="h-5 w-5 text-info flex-shrink-0 mt-0.5"
                        />
                        <div>
                            <p class="text-sm font-medium text-highlighted">
                                Review Instructions
                            </p>
                            <p class="text-sm text-muted mt-1">
                                Below are the details of the requirement to be reviewed.
                                The <strong>Req Id</strong> field will be auto-generated once the
                                requirement is approved.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Requirement Details -->
                <div class="bg-muted/20 rounded-lg p-6">
                    <h2 class="text-lg font-semibold mb-4 text-highlighted">
                        {{ deSlugify(reqType) }} Details
                    </h2>

                    <XForm
                        :state="requirement"
                        :schema="viewSchema"
                        :disabled="true"
                        :on-submit="dummySubmit"
                        :on-cancel="dummyCancel"
                        class="space-y-4"
                    />
                </div>
            </div>

            <template #footer>
                <div class="flex items-center justify-between">
                    <UButton
                        label="Cancel"
                        color="neutral"
                        variant="ghost"
                        :disabled="isProcessing"
                        @click="onCancel"
                    />

                    <div class="flex gap-3">
                        <UButton
                            label="Reject"
                            color="error"
                            icon="i-lucide-x-circle"
                            :loading="isProcessing"
                            :disabled="isProcessing"
                            @click="onReject"
                        />
                        <UButton
                            label="Approve"
                            color="success"
                            icon="i-lucide-check-circle"
                            :loading="isProcessing"
                            :disabled="isProcessing"
                            @click="onApprove"
                        />
                    </div>
                </div>
            </template>
        </UCard>

        <!-- Error/Empty State -->
        <div
            v-else
            class="flex items-center justify-center min-h-96"
        >
            <div class="text-center">
                <UIcon
                    name="i-lucide-alert-circle"
                    class="w-8 h-8 text-error mx-auto mb-2"
                />
                <p class="text-muted">
                    Requirement not found or cannot be reviewed
                </p>
            </div>
        </div>
    </div>
</template>
