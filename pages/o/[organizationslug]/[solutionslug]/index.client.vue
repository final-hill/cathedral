<script lang="ts" setup>
useHead({ title: 'Solution' })
definePageMeta({ name: 'Solution', middleware: 'auth' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Solution').params,
    router = useRouter(),
    { data: solution, error: solutionError } = await useFetch(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    deleteConfirmModalOpenState = ref(false)

if (solutionError.value)
    $eventBus.$emit('page-error', solutionError.value)

const links = [
    { name: 'Project' as const, icon: 'i-lucide-box', label: 'Project', reqId: 'P' },
    { name: 'Environment' as const, icon: 'i-lucide-cloud', label: 'Environment', reqId: 'E' },
    { name: 'Goals' as const, icon: 'i-lucide-target', label: 'Goals', reqId: 'G' },
    { name: 'System' as const, icon: 'i-lucide-building-2', label: 'System', reqId: 'S' }
]

const handleSolutionDelete = async () => {
    await $fetch(`/api/solution/${slug}`, {
        method: 'delete',
        body: { organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))
    deleteConfirmModalOpenState.value = false
    router.push({ name: 'Organization', params: { organizationslug: organizationSlug } })
}

const handleSolutionEdit = () => {
    router.push({ name: 'Edit Solution', params: { solutionslug: slug, organizationslug: organizationSlug } })
}
</script>

<template>
    <PegsLanding :cards="links" :solutionslug="slug" :organizationslug="organizationSlug">
        <template #header>
            <h1>{{ solution!.name }}</h1>
            <p>{{ solution!.description }}</p>

            <section class="flex space-x-4 justify-center">
                <UButton icon="i-lucide-pen" @click="handleSolutionEdit()" label="Edit Solution" />
                <UModal :dismissable="false" v-model:open="deleteConfirmModalOpenState" title="Delete Solution">
                    <UButton icon="i-lucide-trash-2" color="error" label="Delete Solution" />
                    <template #content>
                        Are you sure you want to delete {{ solution!.name }}? This will also delete all associated
                        requirements.
                    </template>
                    <template #footer>
                        <UButton label="Cancel" color="neutral" @click="deleteConfirmModalOpenState = false" />
                        <UButton label="Delete" color="error" @click="handleSolutionDelete()" />
                    </template>
                </UModal>
            </section>

            <section class="mt-4">
                <SlackChannelManager :organization-slug="organizationSlug" :solution-slug="slug" />
            </section>
        </template>
    </PegsLanding>

    <FreeFormRequirements :solutionSlug="slug" :organizationSlug="organizationSlug" />
</template>