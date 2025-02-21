<script lang="ts" setup>
import type { SystemComponentViewModel, SolutionViewModel } from '#shared/models';

useHead({ title: 'Components' })
definePageMeta({ name: 'System Components' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('System Components').params,
    { data: solution, error: getSolutionError } = await useFetch<SolutionViewModel>(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: systemComponents, refresh, status, error: getSystemComponentsError } = await useFetch<SystemComponentViewModel[]>(`/api/system-component`, {
    query: { solutionId, organizationSlug },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
})

if (getSystemComponentsError.value)
    $eventBus.$emit('page-error', getSystemComponentsError.value);

const onCreate = async (data: SystemComponentViewModel) => {
    await $fetch(`/api/system-component`, {
        method: 'POST',
        body: {
            name: data.name,
            description: data.description,
            parentComponent: data.parentComponent,
            solutionId,
            organizationSlug
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: SystemComponentViewModel) => {
    await $fetch(`/api/system-component/${data.id}`, {
        method: 'PUT',
        body: {
            name: data.name,
            description: data.description,
            parentComponent: data.parentComponent,
            solutionId,
            organizationSlug
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/system-component/${id}`, {
        method: 'DELETE',
        body: { solutionId, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>
<template>
    <p>
        Components describe the structure of the system as a list or hierarchy.
    </p>
    <XDataTable :viewModel="{
        reqId: 'text',
        name: 'text',
        description: 'text',
        parentComponent: { type: 'requirement', options: systemComponents ?? [] }
    }" :createModel="{
        name: 'text',
        description: 'text',
        parentComponent: { type: 'requirement', options: systemComponents ?? [] }
    }" :editModel="{
        id: 'hidden',
        name: 'text',
        description: 'text',
        parentComponent: { type: 'requirement', options: systemComponents ?? [] }
    }" :datasource="systemComponents" :onCreate="onCreate" :onUpdate="onUpdate" :onDelete="onDelete"
        :loading="status === 'pending'" :organizationSlug="organizationSlug" entityName="SystemComponent"
        :showRecycleBin="true">
    </XDataTable>
</template>