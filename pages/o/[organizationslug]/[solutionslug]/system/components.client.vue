<script lang="ts" setup>
import { SystemComponent } from '#shared/domain';
import type { z } from 'zod';

useHead({ title: 'Components' })
definePageMeta({ name: 'System Components' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('System Components').params

const { data: systemComponents, refresh, status, error: getSystemComponentsError } = await useFetch<z.infer<typeof SystemComponent>[]>(`/api/system-component`, {
    query: { solutionSlug, organizationSlug },
    transform: (data) => data.map((item) => ({
        ...item,
        lastModified: new Date(item.lastModified),
        creationDate: new Date(item.creationDate)
    }))
})

if (getSystemComponentsError.value)
    $eventBus.$emit('page-error', getSystemComponentsError.value);

const viewSchema = SystemComponent.pick({
    reqId: true,
    name: true,
    description: true,
    parentComponent: true,
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
            solutionSlug,
            organizationSlug
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async ({ id, ...data }: z.infer<typeof editSchema>) => {
    await $fetch(`/api/system-component/${id}`, {
        method: 'PUT',
        body: {
            ...data,
            solutionSlug,
            organizationSlug
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/system-component/${id}`, {
        method: 'DELETE',
        body: { solutionSlug, organizationSlug }
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