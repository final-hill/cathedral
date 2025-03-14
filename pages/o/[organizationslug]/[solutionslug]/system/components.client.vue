<script lang="ts" setup>
import { SystemComponent } from '#shared/domain';
import type { z } from 'zod';

useHead({ title: 'Components' })
definePageMeta({ name: 'System Components' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('System Components').params,
    { data: solution, error: getSolutionError } = await useFetch(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: systemComponents, refresh, status, error: getSystemComponentsError } = await useFetch<z.infer<typeof SystemComponent>[]>(`/api/system-component`, {
    query: { solutionId, organizationSlug },
    transform: (data) => data.map((item) => ({
        ...item,
        lastModified: new Date(item.lastModified),
        creationDate: new Date(item.creationDate)
    }))
})

if (getSystemComponentsError.value)
    $eventBus.$emit('page-error', getSystemComponentsError.value);

const viewSchema = SystemComponent.pick({
    id: true,
    reqId: true,
    name: true,
    description: true
})

const createSchema = SystemComponent.pick({
    name: true,
    description: true,
    parentComponent: true
})

const editSchema = SystemComponent.pick({
    id: true,
    reqId: true,
    name: true,
    description: true,
    parentComponent: true
})

const onCreate = async (data: z.infer<typeof createSchema>) => {
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

const onUpdate = async (data: z.infer<typeof editSchema>) => {
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
    <h1>System Components</h1>
    <p> {{ SystemComponent.description }} </p>

    <XDataTable :viewSchema="viewSchema" :createSchema="createSchema" :editSchema="editSchema" :data="systemComponents"
        :onCreate="onCreate" :onDelete="onDelete" :onUpdate="onUpdate" :loading="status === 'pending'">
    </XDataTable>
</template>