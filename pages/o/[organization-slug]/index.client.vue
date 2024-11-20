<script lang="ts" setup>
import type { OrganizationViewModel, SolutionViewModel } from '#shared/models'

useHead({ title: 'Organization' })
definePageMeta({ name: 'Organization' })

const { $eventBus } = useNuxtApp(),
    { organizationslug: organizationSlug } = useRoute('Organization').params,
    router = useRouter(),
    { data: organization, error: getOrgError, status: orgStatus } = await useFetch<OrganizationViewModel>(`/api/organization/${organizationSlug}`),
    { refresh: refreshSolutions, status: solStatus, data: solutions, error: getSolutionError } = await useFetch<SolutionViewModel[]>('/api/solution', {
        query: { organizationSlug }
    }),
    confirm = useConfirm()

if (!organization.value) {
    $eventBus.$emit('page-error', getOrgError.value)
    throw new Error('Organization not found')
}

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

const handleOrganizationDelete = async (organization: OrganizationViewModel) => {
    confirm.require({
        message: `Are you sure you want to delete "${organization.name}"? This will also delete all associated solutions.`,
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete',
        accept: async () => {
            await $fetch(`/api/organization/${organization.slug}`, {
                method: 'delete'
            }).catch((e) => $eventBus.$emit('page-error', e))
            router.push({ name: 'Home' })
        },
        reject: () => { }
    })
}

const handleOrganizationEdit = (organization: OrganizationViewModel) => {
    router.push({ name: 'Edit Organization', params: { organizationslug: organization.slug } });
}

const handleOrganizationUsers = (organization: OrganizationViewModel) => {
    router.push({ name: 'Organization Users', params: { organizationslug: organization.slug } });
}

const handleSolutionDelete = async (solution: SolutionViewModel) => {
    confirm.require({
        message: `Are you sure you want to delete ${solution.name}?`,
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete',
        accept: async () => {
            await $fetch(`/api/solution/${solution.slug}`, {
                method: 'delete',
                body: { organizationSlug }
            }).catch((e) => $eventBus.$emit('page-error', e))
            await refreshSolutions()
        },
        reject: () => { }
    })
}

const handleSolutionEdit = (solution: SolutionViewModel) => {
    router.push({ name: 'Edit Solution', params: { organizationslug: organizationSlug, solutionslug: solution.slug } });
}
</script>

<template>
    <ProgressSpinner v-if="orgStatus === 'pending'" />
    <p v-if="orgStatus === 'error'">{{ getOrgError }}</p>

    <Toolbar class="mb-6">
        <template #end>
            <Button icon="pi pi-pencil" class="edit-button mr-2" @click="handleOrganizationEdit(organization!)"
                label="Edit Organization" />
            <Button icon="pi pi-users" class="edit-button mr-2" @click="handleOrganizationUsers(organization!)"
                label="Manage Users" />
            <Button icon="pi pi-trash" class="delete-button" @click="handleOrganizationDelete(organization!)"
                severity="danger" label="Delete Organization" />
        </template>
    </Toolbar>

    <ConfirmDialog></ConfirmDialog>
    <div class="grid gap-3">
        <Card class="col shadow-4 border-dashed">
            <template #title>
                <NuxtLink :to="{ name: 'New Solution', params: { organizationslug: organizationSlug } }">
                    New Solution
                </NuxtLink>
            </template>
            <template #subtitle>
                Create a new Solution
            </template>
        </Card>
        <!-- <div v-if="solStatus === 'pending'">
            <ProgressSpinner />
        </div> -->
        <Card class="col shadow-4" v-for="solution in solutions">
            <template #title>
                <NuxtLink
                    :to="{ name: 'Solution', params: { organizationslug: organizationSlug, solutionslug: solution.slug } }">
                    {{ solution.name }}
                </NuxtLink>
            </template>
            <template #subtitle>
                {{ solution.description }}
            </template>
            <template #footer>
                <Button icon="pi pi-pencil" class="edit-button mr-2" @click="handleSolutionEdit(solution)" />
                <Button icon="pi pi-trash" class="delete-button" @click="handleSolutionDelete(solution)"
                    severity="danger" />
            </template>
        </Card>
    </div>
</template>