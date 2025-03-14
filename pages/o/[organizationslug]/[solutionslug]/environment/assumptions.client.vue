<script lang="ts" setup>
import { useFetch } from 'nuxt/app';
import { Assumption } from '#shared/domain';
import type { z } from 'zod';

useHead({ title: 'Assumptions' })
definePageMeta({ name: 'Assumptions' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Assumptions').params,
    { data: solution, error: getSolutionError } = await useFetch(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: assumptions, refresh, status, error: getAssumptionsError } = await useFetch(`/api/assumption`, {
    query: { solutionId, organizationSlug },
    transform: (data) => data.map((item) => ({
        ...item,
        creationDate: new Date(item.creationDate),
        lastModified: new Date(item.lastModified)
    }))
})

if (getAssumptionsError.value)
    $eventBus.$emit('page-error', getAssumptionsError.value);

const viewSchema = Assumption.pick({
    reqId: true,
    name: true,
    description: true
})

const createSchema = Assumption.pick({
    name: true,
    description: true
})

const editSchema = Assumption.pick({
    id: true,
    reqId: true,
    name: true,
    description: true
})

const onCreate = async (data: z.infer<typeof createSchema>) => {
    await $fetch(`/api/assumption`, {
        method: 'post',
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
    await $fetch(`/api/assumption/${id}`, {
        method: 'delete',
        body: { solutionId, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: z.infer<typeof editSchema>) => {
    await $fetch(`/api/assumption/${data.id}`, {
        method: 'put',
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
    <h1>Assumptions</h1>
    <p> {{ Assumption.description }} </p>

    <XDataTable :viewSchema="viewSchema" :createSchema="createSchema" :editSchema="editSchema" :data="assumptions"
        :onCreate="onCreate" :onDelete="onDelete" :onUpdate="onUpdate" :loading="status === 'pending'">
    </XDataTable>
</template>