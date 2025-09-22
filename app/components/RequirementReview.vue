<script setup lang="ts">
import { z } from 'zod'
import type * as req from '#shared/domain/requirements'
import type { FormSchema } from '~/components/XForm.vue'
import type { AccordionItem } from '@nuxt/ui'
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
    reviewCategories = computed((): AccordionItem[] => [
        {
            label: 'Correctness - (Coming Soon)',
            icon: 'i-lucide-check-circle',
            slot: 'correctness' as const,
            class: 'text-warning'
        },
        {
            label: 'Justifiability - (Coming Soon)',
            icon: 'i-lucide-lightbulb',
            slot: 'justifiability' as const,
            class: 'text-warning'
        },
        {
            label: 'Completeness - (Coming Soon)',
            icon: 'i-lucide-list-checks',
            slot: 'completeness' as const,
            class: 'text-warning'
        },
        {
            label: 'Consistency - (Coming Soon)',
            icon: 'i-lucide-align-center',
            slot: 'consistency' as const,
            class: 'text-warning'
        },
        {
            label: 'Non-ambiguity - (Coming Soon)',
            icon: 'i-lucide-eye',
            slot: 'non-ambiguity' as const,
            class: 'text-warning'
        },
        {
            label: 'Feasibility - (Coming Soon)',
            icon: 'i-lucide-wrench',
            slot: 'feasibility' as const,
            class: 'text-warning'
        },
        {
            label: 'Abstractness - (Coming Soon)',
            icon: 'i-lucide-layers',
            slot: 'abstractness' as const,
            class: 'text-warning'
        },
        {
            label: 'Traceability - (Coming Soon)',
            icon: 'i-lucide-git-branch',
            slot: 'traceability' as const,
            class: 'text-warning'
        },
        {
            label: 'Delimitedness - (Coming Soon)',
            icon: 'i-lucide-square-dashed-bottom-code',
            slot: 'delimitedness' as const,
            class: 'text-warning'
        },
        {
            label: 'Readability - (Coming Soon)',
            icon: 'i-lucide-book-open',
            slot: 'readability' as const,
            class: 'text-warning'
        },
        {
            label: 'Modifiability - (Coming Soon)',
            icon: 'i-lucide-edit',
            slot: 'modifiability' as const,
            class: 'text-warning'
        },
        {
            label: 'Verifiability - (Coming Soon)',
            icon: 'i-lucide-shield-check',
            slot: 'verifiability' as const,
            class: 'text-warning'
        },
        {
            label: 'Prioritization - (Coming Soon)',
            icon: 'i-lucide-arrow-up',
            slot: 'prioritization' as const,
            class: 'text-warning'
        },
        {
            label: 'Endorsement - (Coming Soon)',
            icon: 'i-lucide-thumbs-up',
            slot: 'endorsement' as const,
            class: 'text-warning'
        }
    ])

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

                        <!-- Review Categories Accordion -->
                        <UAccordion
                            type="multiple"
                            :items="reviewCategories"
                            class="w-full"
                        >
                            <!-- Correctness -->
                            <template #correctness>
                                <div class="space-y-3">
                                    <p class="text-sm text-muted">
                                        The requirement is correct if it is compatible with actual project parameters,
                                        properties of the environment (Constraints, Assumptions, Effects, Invariants),
                                        organizational goals (Outcomes), and Stakeholder expectations.
                                    </p>
                                    <p class="text-sm text-muted italic">
                                        Review items for Correctness will be implemented here.
                                    </p>
                                </div>
                            </template>

                            <!-- Justifiability -->
                            <template #justifiability>
                                <div class="space-y-3">
                                    <p class="text-sm text-muted">
                                        The requirement is justified if it helps reach a goal (Outcome), resolve an Obstacle, or satisfy a Constraint.
                                    </p>
                                    <p class="text-sm text-muted italic">
                                        Review items for Justifiability will be implemented here.
                                    </p>
                                </div>
                            </template>

                            <!-- Completeness -->
                            <template #completeness>
                                <div class="space-y-3">
                                    <p class="text-sm text-muted">
                                        The requirement is considered complete if it includes:
                                    </p>
                                    <ul class="text-sm text-muted ml-4 space-y-1">
                                        <li>No TBD comments</li>
                                        <li>If this is a Goal requirement, it must reference a Project or System Requirement to ensure the achievement of the goal.</li>
                                        <li>If this is an Epic (G.5), or a Scenario (S.4), There must be Functionality (S.2) to realize it</li>
                                        <li>
                                            Environment Completeness: System Properties must be compatible with Environment Properties. There must be no contradictions.
                                            For example, if there is an Environmental Assumption that "The system will operate in a high-temperature environment",
                                            there should not be a System Use Case that requires "The system will operate only at room temperature".
                                        </li>
                                        <li>
                                            If this is a System Requirement, it must identify all Required Technology Elements (P.5),
                                            Environment Component Interfaces (E.2) it depends on, and what interfaces it provides (S.3)
                                        </li>
                                        <li>
                                            <div class="space-y-1">
                                                <p>
                                                    If this is a System Requirement, make sure that the System description
                                                    determines the effect of every operation on every property of the affected objects.
                                                </p>
                                                <p class="ml-4">
                                                    They define the effect of every operation on every observable property.
                                                </p>
                                                <p class="ml-4">
                                                    It should be possible to determine the effect of every action of the system in terms
                                                    of visible changes in the answers to questions that we may ask of the system.
                                                </p>
                                            </div>
                                        </li>
                                    </ul>
                                    <p class="text-sm text-muted italic">
                                        Review items for Completeness will be implemented here.
                                    </p>
                                </div>
                            </template>

                            <!-- Consistency -->
                            <template #consistency>
                                <div class="space-y-3">
                                    <p class="text-sm text-muted">
                                        A requirement is consistent if it contains no contradiction with other Active Requirements
                                    </p>
                                    <p class="text-sm text-muted italic">
                                        Review items for Consistency will be implemented here.
                                    </p>
                                </div>
                            </template>

                            <!-- Non-ambiguity -->
                            <template #non-ambiguity>
                                <div class="space-y-3">
                                    <p class="text-sm text-muted">
                                        A set of requirements is unambiguous if none of its elements is so expressed as to lend itself to two significantly different understandings.
                                        Technical language must utilize Ubiquitous Language (A Domain of Discourse) and leverage the glossary
                                    </p>
                                    <p class="text-sm text-muted italic">
                                        Review items for Non-ambiguity will be implemented here.
                                    </p>
                                </div>
                            </template>

                            <!-- Feasibility -->
                            <template #feasibility>
                                <div class="space-y-3">
                                    <p class="text-sm text-muted">
                                        A System (resp. Project) requirement is feasible if it is possible, within the constraints of the Environment and Goals, to produce an implementation (resp. schedule) that satisfies it
                                    </p>
                                    <p class="text-sm text-muted italic">
                                        Review items for Feasibility will be implemented here.
                                    </p>
                                </div>
                            </template>

                            <!-- Abstractness -->
                            <template #abstractness>
                                <div class="space-y-3">
                                    <p class="text-sm text-muted">
                                        A System requirement is abstract if it specifies a desired system property without prescribing or favoring specific design or implementation choices. The requirement should be expressed without prescribing a specific implementation.
                                    </p>
                                    <p class="text-sm text-muted italic">
                                        Review items for Abstractness will be implemented here.
                                    </p>
                                </div>
                            </template>

                            <!-- Traceability -->
                            <template #traceability>
                                <div class="space-y-3">
                                    <p class="text-sm text-muted">
                                        A PEGS requirement is traceable if it is possible to follow its consequences, both ways, in other project artifacts including design, implementation and verification elements.
                                    </p>
                                    <p class="text-sm text-muted italic">
                                        Review items for Traceability will be implemented here.
                                    </p>
                                </div>
                            </template>

                            <!-- Delimitedness -->
                            <template #delimitedness>
                                <div class="space-y-3">
                                    <p class="text-sm text-muted">
                                        A set of Goals or System requirements is delimited if it specifies the scope of the future system, making it possible to determine what functionality lies beyond that scope
                                    </p>
                                    <p class="text-sm text-muted italic">
                                        Review items for Delimitedness will be implemented here.
                                    </p>
                                </div>
                            </template>

                            <!-- Readability -->
                            <template #readability>
                                <div class="space-y-3">
                                    <p class="text-sm text-muted">
                                        A requirement is readable if it can be readily understood by its intended audience. All requirements are checked for Readability. Goal requirements must be more readable than other requirements due to the broader audience (non-SMEs).
                                    </p>
                                    <p class="text-sm text-muted italic">
                                        Review items for Readability will be implemented here.
                                    </p>
                                </div>
                            </template>

                            <!-- Modifiability -->
                            <template #modifiability>
                                <div class="space-y-3">
                                    <p class="text-sm text-muted">
                                        A set of requirements is modifiable if it can be adapted in case of changes to Project, Environment, Goals or System properties, through an effort commensurate with the extent of the changes
                                    </p>
                                    <p class="text-sm text-muted italic">
                                        Review items for Modifiability will be implemented here.
                                    </p>
                                </div>
                            </template>

                            <!-- Verifiability -->
                            <template #verifiability>
                                <div class="space-y-3">
                                    <p class="text-sm text-muted">
                                        A System (resp. Project) requirement is verifiable if it is expressed in such a way as to allow determining whether a proposed implementation (resp. the sequence of events in the actual project) satisfies it.
                                    </p>
                                    <p class="text-sm text-muted italic">
                                        Review items for Verifiability will be implemented here.
                                    </p>
                                </div>
                            </template>

                            <!-- Prioritization -->
                            <template #prioritization>
                                <div class="space-y-3">
                                    <p class="text-sm text-muted">
                                        System requirements must have a priority associated with them.
                                    </p>
                                    <p class="text-sm text-muted italic">
                                        Review items for Prioritization will be implemented here.
                                    </p>
                                </div>
                            </template>

                            <!-- Endorsement -->
                            <template #endorsement>
                                <div class="space-y-3">
                                    <p class="text-sm text-muted">
                                        A requirement is endorsed if it has been approved by relevant Key Stakeholders
                                    </p>
                                    <p class="text-sm text-muted italic">
                                        Review items for Endorsement will be implemented here.
                                    </p>
                                </div>
                            </template>
                        </UAccordion>
                    </aside>
                </div>
            </section>

            <!-- Actions Section -->
            <footer class="pt-4 border-t border-default">
                <nav class="flex justify-end gap-3">
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
                </nav>
            </footer>
        </div>
    </article>
</template>
