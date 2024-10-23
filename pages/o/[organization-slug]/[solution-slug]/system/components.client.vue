<script lang="ts" setup>
import { SystemComponent } from '~/server/domain/requirements/SystemComponent.js';
import { type ReqRelModel } from '~/server/domain/types/index.js'

useHead({ title: 'Components' })
definePageMeta({ name: 'System Components' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('System Components').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solution`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: systemComponents, refresh, status, error: getSystemComponentsError } = await useFetch<ReqRelModel<SystemComponent>[]>(`/api/system-component`, {
    query: { solutionId },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
})

if (getSystemComponentsError.value)
    $eventBus.$emit('page-error', getSystemComponentsError.value);

const onCreate = async (data: ReqRelModel<SystemComponent>) => {
    await $fetch(`/api/system-component`, {
        method: 'POST',
        body: {
            name: data.name,
            description: data.description,
            parentComponent: data.parentComponent,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: ReqRelModel<SystemComponent>) => {
    await $fetch(`/api/system-component/${data.id}`, {
        method: 'PUT',
        body: {
            name: data.name,
            description: data.description,
            parentComponent: data.parentComponent,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/system-component/${id}`, {
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
        description: 'text',
        parentComponent: 'object'
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
        :loading="status === 'pending'" :organizationSlug="organizationslug" entityName="SystemComponent"
        :showRecycleBin="true">
    </XDataTable>
</template>