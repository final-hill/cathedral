<script lang="ts" setup>
import type { Properties } from '~/server/domain/Properties';

useHead({ title: 'Organization' })
definePageMeta({ name: 'Organization' })

const { $eventBus } = useNuxtApp(),
    { organizationslug } = useRoute('Organization').params,
    router = useRouter(),
    { data: organizations, error: getOrgError } = await useFetch('/api/organizations', {
        query: { slug: organizationslug }
    }),
    organization = organizations.value![0],
    { refresh, status, data: solutions, error: getSolutionError } = await useFetch('/api/solutions', {
        query: { organizationSlug: organizationslug }
    }),
    confirm = useConfirm()

if (getOrgError.value)
    $eventBus.$emit('page-error', getOrgError.value)

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

type SolutionModel = {
    id: string;
    name: string;
    description: string;
    slug: string;
}

const handleOrganizationDelete = async () => {
    confirm.require({
        message: `Are you sure you want to delete "${organization.name}"? This will also delete all associated solutions.`,
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete',
        accept: async () => {
            await $fetch(`/api/organizations/${organization.id}`, {
                method: 'delete'
            }).catch((e) => $eventBus.$emit('page-error', e))
            router.push({ name: 'Home' })
        },
        reject: () => { }
    })
}

const handleOrganizationEdit = () => {
    router.push({ name: 'Edit Organization', params: { organizationslug: organization.slug } });
}

const handleOrganizationUsers = () => {
    router.push({ name: 'Organization Users', params: { organizationslug: organization.slug } });
}

const handleSolutionDelete = async (solution: Properties<SolutionModel>) => {
    confirm.require({
        message: `Are you sure you want to delete ${solution.name}?`,
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete',
        accept: async () => {
            await $fetch(`/api/solutions/${solution.id}`, {
                method: 'delete'
            }).catch((e) => $eventBus.$emit('page-error', e))
            router.push({ name: 'Organization', params: { organizationslug } });
        },
        reject: () => { }
    })
}

const handleSolutionEdit = (solution: SolutionModel) => {
    router.push({ name: 'Edit Solution', params: { organizationslug, solutionslug: solution.slug } });
}
</script>

<template>
    <Toolbar class="mb-6">
        <template #end>
            <Button icon="pi pi-pencil" class="edit-button mr-2" @click="handleOrganizationEdit()"
                label="Edit Organization" />
            <Button icon="pi pi-users" class="edit-button mr-2" @click="handleOrganizationUsers()"
                label="Manage Users" />
            <Button icon="pi pi-trash" class="delete-button" @click="handleOrganizationDelete()" severity="danger"
                label="Delete Organization" />
        </template>
    </Toolbar>

    <ConfirmDialog></ConfirmDialog>
    <div class="grid gap-3">
        <Card class="col shadow-4 border-dashed">
            <template #title>
                <NuxtLink :to="{ name: 'New Solution', params: { organizationslug } }">
                    New Solution
                </NuxtLink>
            </template>
            <template #subtitle>
                Create a new Solution
            </template>
        </Card>
        <div v-if="status === 'pending'">
            <ProgressSpinner />
        </div>
        <Card class="col shadow-4" v-for="solution in solutions">
            <template #title>
                <NuxtLink :to="{ name: 'Solution', params: { organizationslug, solutionslug: solution.slug } }">
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