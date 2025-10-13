<script lang="ts" setup>
import type { OrganizationType, SolutionType } from '#shared/domain'
import { Organization, Solution } from '#shared/domain'
import { z } from 'zod'

useHead({ title: 'Organization' })
definePageMeta({ name: 'Organization', middleware: 'auth' })

const { $eventBus } = useNuxtApp(),
    { organizationslug: organizationSlug } = useRoute('Organization').params,
    router = useRouter(),
    { data: organization, error: getOrgError, status: _orgStatus } = await useApiRequest({ url: `/api/organization/${organizationSlug}`, options: {
        schema: Organization
    } }),
    { refresh: refreshSolutions, status: _solStatus, data: solutions, error: getSolutionError } = await useApiRequest({ url: '/api/solution', options: {
        schema: z.array(Solution),
        query: { organizationSlug }
    } }),
    solutionDeleteModalOpenState = ref(false),
    organizationDeleteModalOpenState = ref(false)

if (!organization.value) {
    $eventBus.$emit('page-error', getOrgError.value)
    throw new Error('Organization not found')
}

if (getSolutionError.value) $eventBus.$emit('page-error', getSolutionError.value)

const handleOrganizationDelete = async (organization: OrganizationType) => {
        await useApiRequest({ url: `/api/organization/${organization.slug}`, options: {
            method: 'DELETE',
            schema: z.unknown(),
            showSuccessToast: true,
            successMessage: 'Organization deleted successfully',
            errorMessage: 'Failed to delete organization'
        } })
        organizationDeleteModalOpenState.value = false
        router.push({ name: 'Home' })
    },
    handleOrganizationEdit = (organization: OrganizationType) => {
        router.push({ name: 'Edit Organization', params: { organizationslug: organization.slug } })
    },
    handleOrganizationUsers = (organization: OrganizationType) => {
        router.push({ name: 'Organization Users', params: { organizationslug: organization.slug } })
    },
    handleSolutionDelete = async (solution: SolutionType) => {
        await useApiRequest({ url: `/api/solution/${solution.slug}`, options: {
            method: 'DELETE',
            schema: z.unknown(),
            body: { organizationSlug },
            showSuccessToast: true,
            successMessage: 'Solution deleted successfully',
            errorMessage: 'Failed to delete solution'
        } })
        solutionDeleteModalOpenState.value = false
        await refreshSolutions()
    },
    handleSolutionEdit = (solution: SolutionType) => {
        router.push({ name: 'Edit Solution', params: { organizationslug: organizationSlug, solutionslug: solution.slug } })
    }
</script>

<template>
    <h1> {{ organization!.name }} </h1>
    <p> {{ organization!.description }} </p>

    <section class="flex space-x-4 justify-center">
        <UButton
            icon="i-lucide-pen"
            color="primary"
            label="Edit Organization"
            @click="handleOrganizationEdit(organization!)"
        />
        <UButton
            icon="i-lucide-users"
            color="neutral"
            label="Manage Users"
            @click="handleOrganizationUsers(organization!)"
        />
        <UModal
            v-model:open="organizationDeleteModalOpenState"
            :dismissable="false"
            title="Delete Organization"
        >
            <UButton
                icon="i-lucide-trash-2"
                color="error"
                label="Delete Organization"
            />
            <template #content>
                Are you sure you want to delete {{ organization!.name }}? This will also delete all associated
                solutions.
            </template>
            <template #footer>
                <UButton
                    label="Cancel"
                    color="neutral"
                    @click="organizationDeleteModalOpenState = false"
                />
                <UButton
                    label="Delete"
                    color="error"
                    @click="handleOrganizationDelete(organization!)"
                />
            </template>
        </UModal>
    </section>

    <section class="mt-4 text-center">
        <SlackWorkspaceManager :organization-slug="organizationSlug" />
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard variant="outline">
            <template #header>
                <NuxtLink
                    class="font-bold text-xl"
                    :to="{ name: 'New Solution', params: { organizationslug: organizationSlug } }"
                >
                    <p>New Solution</p>
                    <small> Create a new Solution </small>
                </NuxtLink>
            </template>
            <template #footer>
                <p>&nbsp;</p>
            </template>
        </UCard>

        <UCard
            v-for="solution in solutions"
            :key="solution.slug"
            variant="subtle"
        >
            <template #header>
                <NuxtLink
                    class="font-bold text-xl"
                    :to="{ name: 'Solution', params: { organizationslug: organizationSlug, solutionslug: solution.slug } }"
                >
                    <p> {{ solution.name }} </p>
                    <small> {{ solution.description }} </small>
                </NuxtLink>
            </template>
            <template #footer>
                <div class="flex gap-2">
                    <UButton
                        icon="i-lucide-pen"
                        color="primary"
                        title="Edit Solution"
                        @click="handleSolutionEdit(solution)"
                    />
                    <UModal
                        v-model:open="solutionDeleteModalOpenState"
                        :dismissable="false"
                        title="Delete Solution"
                    >
                        <UButton
                            icon="i-lucide-trash-2"
                            color="error"
                            title="Delete Solution"
                        />
                        <template #content>
                            Are you sure you want to delete {{ solution.name }}? This will also delete all
                            associated
                            requirements.
                        </template>
                        <template #footer>
                            <UButton
                                label="Cancel"
                                color="neutral"
                                @click="solutionDeleteModalOpenState = false"
                            />
                            <UButton
                                label="Delete"
                                color="error"
                                @click="handleSolutionDelete(solution)"
                            />
                        </template>
                    </UModal>
                </div>
            </template>
        </UCard>
    </section>
</template>
