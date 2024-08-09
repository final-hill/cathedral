<script lang="ts" setup>
import type { RoutesNamesList } from '#build/typed-router/__routes';

useHead({ title: 'Solution' })
definePageMeta({ name: 'Solution' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Solution').params,
    router = useRouter(),
    { data: solutions, error: getSolutionError } = await useFetch('/api/solutions', {
        query: {
            organizationSlug: organizationslug,
            slug: solutionslug
        }
    }),
    solution = solutions.value![0],
    confirm = useConfirm()

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

const links: { name: RoutesNamesList, icon: string, label: string }[] = [
    { name: 'Project', icon: 'pi-box', label: 'Project' },
    { name: 'Environment', icon: 'pi-cloud', label: 'Environment' },
    { name: 'Goals', icon: 'pi-bullseye', label: 'Goals' },
    { name: 'System', icon: 'pi-sitemap', label: 'System' }
]

const handleSolutionDelete = async () => {
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
            router.push({ name: 'Organization', params: { organizationslug } })
        },
        reject: () => { }
    })
}

const handleSolutionEdit = () => {
    router.push({ name: 'Edit Solution', params: { solutionslug, organizationslug } })
}
</script>

<template>
    <Toolbar class="mb-6">
        <template #end>
            <Button icon="pi pi-pencil" class="edit-button mr-2" @click="handleSolutionEdit()" label="Edit Solution" />
            <Button icon="pi pi-trash" class="delete-button" @click="handleSolutionDelete()" severity="danger"
                label="Delete Solution" />
        </template>
    </Toolbar>
    <ConfirmDialog></ConfirmDialog>
    <div class="grid">
        <NuxtLink v-for="link in links" :key="link.name"
            :to="{ name: link.name, params: { solutionslug, organizationslug } }" class="col-fixed w-2 mr-4">
            <Button :label="link.label" class="w-full h-5rem text-1xl" :icon="`pi ${link.icon} text-3xl`" iconPos="top"
                severity="secondary" />
        </NuxtLink>
    </div>
</template>