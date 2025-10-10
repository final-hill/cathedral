<script lang="ts" setup>
import { ReqType, Solution } from '#shared/domain'
import { z } from 'zod'

useHead({ title: 'Solution' })
definePageMeta({ name: 'Solution', middleware: 'auth' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Solution').params,
    router = useRouter(),
    { data: solution, error: solutionError } = await useApiRequest(`/api/solution/${slug}`, {
        schema: Solution,
        query: { organizationSlug },
        errorMessage: 'Failed to load solution'
    }),
    deleteConfirmModalOpenState = ref(false)

if (solutionError.value) $eventBus.$emit('page-error', solutionError.value)

// Minimum requirements validation
const { getMissingRequirementsBySection } = useMinimumRequirements(),
    missingRequirements = ref<{ reqType: ReqType, label: string, section: string, code: string, path: string }[]>([]),
    drawerOpen = ref(false)

// Load missing requirements when solution is available
watch(solution, async (newSolution) => {
    if (newSolution) {
        try {
            const groupedMissing = await getMissingRequirementsBySection({
                organizationSlug: organizationSlug as string,
                solutionSlug: slug as string
            })
            // Flatten the grouped results back to an array for the drawer
            missingRequirements.value = Object.values(groupedMissing).flat()
        } catch (error) {
            console.warn('Failed to load missing requirements:', error)
            missingRequirements.value = []
        }
    }
}, { immediate: true })

const links = [
        {
            label: 'Project',
            icon: 'i-lucide-box',
            reqId: 'P',
            path: `/o/${organizationSlug}/${slug}/project`,
            minActiveReqTypes: [ReqType.MILESTONE, ReqType.TASK]
        },
        {
            label: 'Environment',
            icon: 'i-lucide-cloud',
            reqId: 'E',
            path: `/o/${organizationSlug}/${slug}/environment`,
            minActiveReqTypes: [ReqType.CONSTRAINT]
        },
        {
            label: 'Goals',
            icon: 'i-lucide-target',
            reqId: 'G',
            path: `/o/${organizationSlug}/${slug}/goals`,
            minActiveReqTypes: [ReqType.CONTEXT_AND_OBJECTIVE, ReqType.OUTCOME, ReqType.STAKEHOLDER]
        },
        {
            label: 'System',
            icon: 'i-lucide-building-2',
            reqId: 'S',
            path: `/o/${organizationSlug}/${slug}/system`,
            minActiveReqTypes: [ReqType.SYSTEM_COMPONENT, ReqType.FUNCTIONAL_BEHAVIOR]
        }
    ],
    handleSolutionDelete = async () => {
        await useApiRequest(`/api/solution/${slug}`, {
            method: 'DELETE',
            schema: z.unknown(),
            body: { organizationSlug },
            showSuccessToast: true,
            successMessage: 'Solution deleted successfully',
            errorMessage: 'Failed to delete solution'
        })
        deleteConfirmModalOpenState.value = false
        router.push({ name: 'Organization', params: { organizationslug: organizationSlug } })
    },
    handleSolutionEdit = () => {
        router.push({ name: 'Edit Solution', params: { solutionslug: slug, organizationslug: organizationSlug } })
    }
</script>

<template>
    <PegsLanding
        :cards="links"
        :solutionslug="slug"
        :organizationslug="organizationSlug"
    >
        <template #header>
            <h1>{{ solution!.name }}</h1>
            <p>{{ solution!.description }}</p>

            <PendingReviewsNotification
                :organization-slug="organizationSlug"
                :solution-slug="slug"
            />

            <MinimumRequirementsDrawer
                v-model:open="drawerOpen"
                :missing-requirements="missingRequirements"
            />

            <section class="flex space-x-4 justify-center">
                <UButton
                    icon="i-lucide-pen"
                    label="Edit Solution"
                    @click="handleSolutionEdit()"
                />
                <UModal
                    v-model:open="deleteConfirmModalOpenState"
                    :dismissable="false"
                    title="Delete Solution"
                >
                    <UButton
                        icon="i-lucide-trash-2"
                        color="error"
                        label="Delete Solution"
                    />
                    <template #content>
                        Are you sure you want to delete {{ solution!.name }}? This will also delete all associated
                        requirements.
                    </template>
                    <template #footer>
                        <UButton
                            label="Cancel"
                            color="neutral"
                            @click="deleteConfirmModalOpenState = false"
                        />
                        <UButton
                            label="Delete"
                            color="error"
                            @click="handleSolutionDelete()"
                        />
                    </template>
                </UModal>
            </section>

            <section class="mt-4">
                <SlackChannelManager
                    :organization-slug="organizationSlug"
                    :solution-slug="slug"
                />
            </section>
        </template>
    </PegsLanding>

    <FreeFormRequirements
        :solution-slug="slug"
        :organization-slug="organizationSlug"
    />
</template>
