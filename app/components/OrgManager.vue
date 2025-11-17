<script lang="ts" setup>
import type { OrganizationType } from '#shared/domain'
import { Organization } from '#shared/domain'
import { z } from 'zod'

const router = useRouter(),
    { data: organizations, refresh } = await useApiRequest({ url: '/api/organization', options: {
        schema: z.array(Organization)
    } }),
    deleteModalOpenState = ref(false),
    handleDelete = async (organization: OrganizationType) => {
        await useApiRequest({ url: `/api/organization/${organization.slug}`, options: {
            method: 'DELETE',
            schema: z.unknown(),
            showSuccessToast: true,
            successMessage: `Organization "${organization.name}" deleted successfully`,
            errorMessage: `Failed to delete organization "${organization.name}"`
        } })

        deleteModalOpenState.value = false
        refresh()
    },
    handleEdit = (organization: { slug: string }) => {
        router.push({ name: 'Edit Organization', params: { organizationslug: organization.slug } })
    },
    handleUsers = (organization: { slug: string }) => {
        router.push({ name: 'Organization Users', params: { organizationslug: organization.slug } })
    }
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard variant="outline">
            <template #header>
                <NuxtLink
                    class="font-bold text-xl"
                    :to="{ name: 'New Organization' }"
                >
                    New Organization
                </NuxtLink>
                <p>
                    Create a new Organization
                </p>
            </template>
        </UCard>
        <UCard
            v-for="organization in organizations"
            :key="organization.slug"
            variant="subtle"
        >
            <template #header>
                <NuxtLink
                    class="font-bold text-xl"
                    :to="{ name: 'Organization', params: { organizationslug: organization.slug } }"
                >
                    {{ organization.name }}
                </NuxtLink>
                <p>
                    {{ organization.description }}
                </p>
            </template>
            <template #footer>
                <div class="flex gap-2">
                    <UButton
                        icon="i-lucide-pen"
                        color="primary"
                        title="Edit Organization"
                        @click="handleEdit(organization)"
                    />
                    <UButton
                        icon="i-lucide-users"
                        color="neutral"
                        title="Manage Users"
                        @click="handleUsers(organization)"
                    />
                    <UModal
                        v-model:open="deleteModalOpenState"
                        :dismissable="false"
                        title="Delete Organization"
                    >
                        <UButton
                            icon="i-lucide-trash-2"
                            color="error"
                            title="Delete Organization"
                        />
                        <template #body>
                            Are you sure you want to delete {{ organization.name }}? This will also delete all
                            associated
                            solutions.
                        </template>
                        <template #footer>
                            <UButton
                                label="Cancel"
                                color="neutral"
                                @click="deleteModalOpenState = false"
                            />
                            <UButton
                                label="Delete"
                                color="error"
                                @click="handleDelete(organization)"
                            />
                        </template>
                    </UModal>
                </div>
            </template>
        </UCard>
    </div>
</template>
