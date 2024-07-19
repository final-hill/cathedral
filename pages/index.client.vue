<script lang="ts" setup>
import Organization from '~/server/domain/application/Organization';
import type { Properties } from '~/server/domain/Properties';

definePageMeta({ name: 'Home' })

const router = useRouter(),
    { status, data: organizations, refresh } = await useFetch('/api/organizations'),
    confirm = useConfirm()

const handleDelete = async (organization: Properties<Organization>) => {
    confirm.require({
        message: `Are you sure you want to delete ${Organization.name}? This will also delete all associated solutions.`,
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete',
        accept: async () => {
            await $fetch(`/api/organizations/${organization.id}`, {
                method: 'delete'
            })
            refresh()
        },
        reject: () => { }
    })
}

const handleEdit = (organization: Organization) => {
    router.push({ name: 'Edit Organization', params: { organizationSlug: organization.slug } });
}

const handleSettings = (organization: Organization) => {
    router.push({ name: 'Organization Settings', params: { organizationSlug: organization.slug } });
}
</script>

<template>
    <ConfirmDialog></ConfirmDialog>
    <div class="grid gap-3">
        <Card class="col shadow-4 border-dashed">
            <template #title>
                <NuxtLink :to="{ name: 'New Organization' }">
                    New Organization
                </NuxtLink>
            </template>
            <template #subtitle>
                Create a new Organization
            </template>
        </Card>
        <div v-if="status === 'pending'">
            <ProgressSpinner />
        </div>
        <Card class="col shadow-4" v-for="organization in organizations">
            <template #title>
                <NuxtLink :to="{ name: 'Organization', params: { organizationSlug: organization.slug } }">
                    {{ organization.name }}
                </NuxtLink>
            </template>
            <template #subtitle>
                {{ organization.description }}
            </template>
            <template #footer>
                <Button icon="pi pi-pencil" class="edit-button mr-2"
                    @click="handleEdit(organization as Organization)" />
                <Button icon="pi pi-cog" class="edit-button mr-2"
                    @click="handleSettings(organization as Organization)" />
                <Button icon="pi pi-trash" class="delete-button" @click="handleDelete(organization as Organization)"
                    severity="danger" />
            </template>
        </Card>
    </div>
</template>