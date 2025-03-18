<script lang="ts" setup>
import { useHead, useRoute, useNuxtApp, useFetch } from '#imports';
import { EnvironmentComponent } from '#shared/domain';
import { z } from 'zod';

useHead({ title: 'Components' })
definePageMeta({ name: 'Environment Components' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Environment Components').params,
    { data: solution, error: getSolutionError } = await useFetch(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id,
    { data: environmentComponents, status, refresh, error: getEnvironmentComponentsError } = await useFetch<z.infer<typeof EnvironmentComponent>[]>(`/api/environment-component`, {
        query: { solutionId, organizationSlug },
        transform: (data) => data.map((item) => ({
            ...item,
            lastModified: new Date(item.lastModified),
            creationDate: new Date(item.creationDate)
        }))
    })

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

if (getEnvironmentComponentsError.value)
    $eventBus.$emit('page-error', getEnvironmentComponentsError.value)

const viewSchema = EnvironmentComponent.pick({
    reqId: true,
    name: true,
    description: true
})

const createSchema = EnvironmentComponent.pick({
    name: true,
    description: true
})

const editSchema = EnvironmentComponent.pick({
    id: true,
    reqId: true,
    name: true,
    description: true
})

const onCreate = async (data: z.infer<typeof createSchema>) => {
    await $fetch(`/api/environment-component`, {
        method: 'POST',
        body: {
            name: data.name,
            description: data.description,
            solutionId,
            organizationSlug
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/environment-component/${id}`, {
        method: 'DELETE',
        body: { solutionId, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh()
}

const onUpdate = async (data: z.infer<typeof editSchema>) => {
    await $fetch(`/api/environment-component/${data.id}`, {
        method: 'PUT',
        body: {
            name: data.name,
            description: data.description,
            solutionId,
            organizationSlug
        }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh()
}
</script>

<template>
    <h1> Environment Components </h1>
    <p> {{ EnvironmentComponent.description }} </p>
    <XDataTable :viewSchema="viewSchema" :createSchema="createSchema" :editSchema="editSchema"
        :data="environmentComponents" :onCreate="onCreate" :onDelete="onDelete" :onUpdate="onUpdate"
        :loading="status === 'pending'">
    </XDataTable>
</template>