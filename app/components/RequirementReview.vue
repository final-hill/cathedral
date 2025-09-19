<script setup lang="ts">
import { z } from 'zod'
import type * as req from '#shared/domain/requirements'
import type { FormSchema } from '~/components/XForm.vue'
import { WorkflowState } from '#shared/domain/requirements/enums'
import { workflowColorMap } from '#shared/utils/workflow-colors'
import { getSchemaFields } from '#shared/utils/getSchemaFields'

const props = defineProps<{
        requirement: req.RequirementType
        schema: FormSchema
        reqType: string
        organizationSlug: string
        solutionSlug: string
        loading?: boolean
    }>(),
    emit = defineEmits<{
        approved: [requirement: req.RequirementType]
        rejected: [requirement: req.RequirementType]
        cancelled: []
    }>(),
    { requirement, schema, reqType, organizationSlug, solutionSlug, loading = false } = toRefs(props),
    // Apply common review omits - same as RequirementView
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
        uiBasePathTemplate: true
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
    getStringValue = (value: unknown): string => value as string

// Validate that the requirement can be reviewed
if (requirement.value.workflowState !== WorkflowState.Review) {
    throw createError({
        statusCode: 403,
        statusMessage: `Cannot review requirement in ${requirement.value.workflowState} state. Only requirements in Review state can be reviewed.`
    })
}

const router = useRouter(),
    toast = useToast(),
    isProcessing = ref(false),
    onApprove = async () => {
        isProcessing.value = true
        try {
            await $fetch(`/api/requirements/${reqType.value}/review/${requirement.value.id}/approve`, {
                method: 'POST',
                body: {
                    solutionSlug: solutionSlug.value,
                    organizationSlug: organizationSlug.value
                }
            })

            toast.add({
                icon: 'i-lucide-check',
                title: 'Success',
                description: 'Requirement approved successfully'
            })

            emit('approved', requirement.value)
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
        isProcessing.value = true
        try {
            await $fetch(`/api/requirements/${reqType.value}/review/${requirement.value.id}/reject`, {
                method: 'POST',
                body: {
                    solutionSlug: solutionSlug.value,
                    organizationSlug: organizationSlug.value
                }
            })

            toast.add({
                icon: 'i-lucide-check',
                title: 'Success',
                description: 'Requirement rejected'
            })

            emit('rejected', requirement.value)
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
    onCancel = () => {
        emit('cancelled')
        router.back()
    }
</script>

<template>
    <div class="flex flex-col h-full">
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
            <div class="pb-4 border-b border-default">
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

                <!-- Review Instructions -->
                <div class="bg-info/10 border border-info/20 rounded-lg p-4 mt-4">
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
            </div>

            <!-- Content Section -->
            <div class="flex-1 py-6 space-y-6 overflow-y-auto">
                <div
                    v-for="field in displayFields"
                    :key="field.key"
                    class="space-y-2"
                >
                    <label
                        class="block text-sm font-medium text-toned"
                    >
                        {{ field.label }}
                    </label>

                    <!-- Custom field slot - allows parent to provide custom display -->
                    <slot
                        v-if="$slots[`field-${field.key}`]"
                        :name="`field-${field.key}`"
                        :field="field"
                        :model-value="getFieldValue(field.key)"
                        :field-key="field.key"
                    />
                    <!-- Default rendering based on field type -->
                    <div v-else-if="field.isObject && getObjectName(getFieldValue(field.key))">
                        <UBadge
                            :label="getObjectName(getFieldValue(field.key))"
                            color="info"
                            variant="soft"
                        />
                    </div>
                    <div v-else-if="field.innerType instanceof z.ZodBoolean">
                        <UCheckbox
                            :model-value="getBooleanValue(getFieldValue(field.key))"
                            disabled
                        />
                    </div>
                    <div v-else-if="field.innerType instanceof z.ZodDate">
                        <time :datetime="getDateValue(getFieldValue(field.key)).toISOString()">
                            {{ getDateValue(getFieldValue(field.key)).toLocaleString() }}
                        </time>
                    </div>
                    <div v-else-if="field.isEnum">
                        <UBadge
                            :label="getStringValue(getFieldValue(field.key))"
                            color="neutral"
                            variant="soft"
                        />
                    </div>
                    <div v-else-if="field.isArray">
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
                    </div>
                    <div v-else>
                        <!-- Default display for field values -->
                        <p class="text-muted">
                            {{ getFieldValue(field.key) }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Actions Section -->
            <div class="pt-4 border-t border-default">
                <div class="flex justify-end gap-3">
                    <UButton
                        variant="ghost"
                        color="neutral"
                        :loading="loading || isProcessing"
                        @click="onCancel"
                    >
                        Cancel
                    </UButton>
                    <UButton
                        variant="outline"
                        color="error"
                        :loading="isProcessing"
                        :disabled="loading"
                        @click="onReject"
                    >
                        Reject
                    </UButton>
                    <UButton
                        color="success"
                        :loading="isProcessing"
                        :disabled="loading"
                        @click="onApprove"
                    >
                        Approve
                    </UButton>
                </div>
            </div>
        </div>
    </div>
</template>
