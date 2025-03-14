<script lang="ts" setup>
import { Organization } from '#shared/domain'
import type { z } from 'zod'

definePageMeta({ name: 'Home' })

const router = useRouter(),
    { status, data: organizations, refresh, error: getOrgError } = await useFetch('/api/organization', {
        transform: (data) => data.map((item) => ({
            ...item,
            lastModified: new Date(item.lastModified),
            creationDate: new Date(item.creationDate)
        }))
    }),
    { $eventBus } = useNuxtApp(),
    deleteModalOpenState = ref(false)

if (getOrgError.value)
    $eventBus.$emit('page-error', getOrgError.value)

const handleDelete = async (organization: z.infer<typeof Organization>) => {
    await $fetch(`/api/organization/${organization.slug}`, {
        method: 'delete'
    }).catch((e) => $eventBus.$emit('page-error', e))
    deleteModalOpenState.value = false
    refresh()
}

const handleEdit = (organization: { slug: string }) => {
    router.push({ name: 'Edit Organization', params: { organizationslug: organization.slug } });
}

const handleUsers = (organization: { slug: string }) => {
    router.push({ name: 'Organization Users', params: { organizationslug: organization.slug } });
}
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard variant="outline">
            <template #header>
                <NuxtLink class="font-bold text-xl" :to="{ name: 'New Organization' }">
                    New Organization
                </NuxtLink>
                <p>
                    Create a new Organization
                </p>
            </template>
        </UCard>
        <UCard variant="subtle" v-for="organization in organizations" :key="organization.slug">
            <template #header>
                <NuxtLink class="font-bold text-xl"
                    :to="{ name: 'Organization', params: { organizationslug: organization.slug } }">
                    {{ organization.name }}
                </NuxtLink>
                <p>
                    {{ organization.description }}
                </p>
            </template>
            <template #footer>
                <div class="flex gap-2">
                    <UButton icon="i-lucide-pen" color="primary" @click="handleEdit(organization)"
                        title="Edit Organization" />
                    <UButton icon="i-lucide-users" color="neutral" @click="handleUsers(organization)"
                        title="Manage Users" />
                    <UModal :dismissable="false" v-model:open="deleteModalOpenState" title="Delete Organization">
                        <UButton icon="i-lucide-trash-2" color="error" title="Delete Organization" />
                        <template #body>
                            Are you sure you want to delete {{ organization.name }}? This will also delete all
                            associated
                            solutions.
                        </template>
                        <template #footer>
                            <UButton label="Cancel" color="neutral" @click="deleteModalOpenState = false" />
                            <UButton label="Delete" color="error" @click="handleDelete(organization)" />
                        </template>
                    </UModal>
                </div>
            </template>
        </UCard>
    </div>
</template>