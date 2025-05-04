<script lang="ts" setup>
import { Organization, Solution } from '#shared/domain'
import type { z } from 'zod'

useHead({ title: 'Organization' })
definePageMeta({ name: 'Organization', middleware: 'auth' })

const { $eventBus } = useNuxtApp(),
    { organizationslug: organizationSlug } = useRoute('Organization').params,
    router = useRouter(),
    { data: organization, error: getOrgError, status: orgStatus } = await useFetch<z.infer<typeof Organization>>(`/api/organization/${organizationSlug}`),
    { refresh: refreshSolutions, status: solStatus, data: solutions, error: getSolutionError } = await useFetch<z.infer<typeof Solution>[]>('/api/solution', {
        query: { organizationSlug }
    }),
    solutionDeleteModalOpenState = ref(false),
    organizationDeleteModalOpenState = ref(false)

if (!organization.value) {
    $eventBus.$emit('page-error', getOrgError.value)
    throw new Error('Organization not found')
}

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

const handleOrganizationDelete = async (organization: z.infer<typeof Organization>) => {
    await $fetch(`/api/organization/${organization.slug}`, {
        method: 'delete'
    }).catch((e) => $eventBus.$emit('page-error', e))
    organizationDeleteModalOpenState.value = false
    router.push({ name: 'Home' })
}

const handleOrganizationEdit = (organization: z.infer<typeof Organization>) => {
    router.push({ name: 'Edit Organization', params: { organizationslug: organization.slug } });
}

const handleOrganizationUsers = (organization: z.infer<typeof Organization>) => {
    router.push({ name: 'Organization Users', params: { organizationslug: organization.slug } });
}

const handleSolutionDelete = async (solution: z.infer<typeof Solution>) => {
    await $fetch(`/api/solution/${solution.slug}`, {
        method: 'delete',
        body: { organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))
    solutionDeleteModalOpenState.value = false
    await refreshSolutions()
}

const handleSolutionEdit = (solution: z.infer<typeof Solution>) => {
    router.push({ name: 'Edit Solution', params: { organizationslug: organizationSlug, solutionslug: solution.slug } });
}
</script>

<template>
    <h1> {{ organization!.name }} </h1>
    <p> {{ organization!.description }} </p>

    <section class="flex space-x-4 justify-center">
        <UButton icon="i-lucide-pen" color="primary" @click="handleOrganizationEdit(organization!)"
            label="Edit Organization" />
        <UButton icon="i-lucide-users" color="neutral" @click="handleOrganizationUsers(organization!)"
            label="Manage Users" />
        <UModal :dismissable="false" v-model:open="organizationDeleteModalOpenState" title="Delete Organization">
            <UButton icon="i-lucide-trash-2" color="error" label="Delete Organization" />
            <template #content>
                Are you sure you want to delete {{ organization!.name }}? This will also delete all associated
                solutions.
            </template>
            <template #footer>
                <UButton label="Cancel" color="neutral" @click="organizationDeleteModalOpenState = false" />
                <UButton label="Delete" color="error" @click="handleOrganizationDelete(organization!)" />
            </template>
        </UModal>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard variant="outline">
            <template #header>
                <NuxtLink class="font-bold text-xl"
                    :to="{ name: 'New Solution', params: { organizationslug: organizationSlug } }">
                    <p>New Solution</p>
                    <small> Create a new Solution </small>
                </NuxtLink>
            </template>
            <template #footer>
                <p>&nbsp;</p>
            </template>
        </UCard>

        <UCard variant="subtle" v-for="solution in solutions" :key="solution.slug">
            <template #header>
                <NuxtLink class="font-bold text-xl"
                    :to="{ name: 'Solution', params: { organizationslug: organizationSlug, solutionslug: solution.slug } }">
                    <p> {{ solution.name }} </p>
                    <small> {{ solution.description }} </small>
                </NuxtLink>
            </template>
            <template #footer>
                <div class="flex gap-2">
                    <UButton icon="i-lucide-pen" color="primary" @click="handleSolutionEdit(solution)"
                        title="Edit Solution" />
                    <UModal :dismissable="false" v-model:open="solutionDeleteModalOpenState" title="Delete Solution">
                        <UButton icon="i-lucide-trash-2" color="error" title="Delete Solution" />
                        <template #content>
                            Are you sure you want to delete {{ solution.name }}? This will also delete all
                            associated
                            requirements.
                        </template>
                        <template #footer>
                            <UButton label="Cancel" color="neutral" @click="solutionDeleteModalOpenState = false" />
                            <UButton label="Delete" color="error" @click="handleSolutionDelete(solution)" />
                        </template>
                    </UModal>
                </div>
            </template>
        </UCard>
    </section>
</template>