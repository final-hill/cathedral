<script lang="ts" setup>
import { SystemComponent } from '~/server/domain/SystemComponent.js';

useHead({ title: 'Components' })
definePageMeta({ name: 'System Components' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('System Components').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: systemComponents, refresh, status, error: getSystemComponentsError } = await useFetch<SystemComponent[]>(`/api/system-components`, {
    query: { solutionId },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
})

if (getSystemComponentsError.value)
    $eventBus.$emit('page-error', getSystemComponentsError.value);

const onCreate = async (data: SystemComponent) => {
    await $fetch(`/api/system-components`, {
        method: 'POST',
        body: {
            name: data.name,
            statement: data.statement,
            parentComponentId: data.parentComponent,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: SystemComponent) => {
    await $fetch(`/api/system-components/${data.id}`, {
        method: 'PUT',
        body: {
            name: data.name,
            statement: data.statement,
            parentComponentId: data.parentComponent,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/system-components/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>
<template>
    <p>
        Components describe the structure of the system as a list or hierarchy.
    </p>
    <XDataTable :viewModel="{
        name: 'text',
        statement: 'text',
        parentComponent: 'object'
    }" :createModel="{
        name: 'text',
        statement: 'text',
        parentComponent: { type: 'requirement', options: systemComponents ?? [] }
    }" :editModel="{
        id: 'hidden',
        name: 'text',
        statement: 'text',
        parentComponent: { type: 'requirement', options: systemComponents ?? [] }
    }" :datasource="systemComponents" :onCreate="onCreate" :onUpdate="onUpdate" :onDelete="onDelete"
        :loading="status === 'pending'" :show-history="true" :organizationSlug="organizationslug">
    </XDataTable>
</template>