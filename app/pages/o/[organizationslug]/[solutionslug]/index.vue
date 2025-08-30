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

if (solutionError.value) $eventBus.$emit('page-error', solutionError.value)

const links = [
        {
            label: 'Project',
            icon: 'i-lucide-box',
            reqId: 'P',
            path: `/o/${organizationSlug}/${slug}/project`
        },
        {
            label: 'Environment',
            icon: 'i-lucide-cloud',
            reqId: 'E',
            path: `/o/${organizationSlug}/${slug}/environment`
        },
        {
            label: 'Goals',
            icon: 'i-lucide-target',
            reqId: 'G',
            path: `/o/${organizationSlug}/${slug}/goals`
        },
        {
            label: 'System',
            icon: 'i-lucide-building-2',
            reqId: 'S',
            path: `/o/${organizationSlug}/${slug}/system`
        }
    ],
    handleSolutionDelete = async () => {
        await $fetch(`/api/solution/${slug}`, {
            method: 'delete',
            body: { organizationSlug }
        }).catch(e => $eventBus.$emit('page-error', e))
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
