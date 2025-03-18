<script lang="ts" setup>
import { Outcome } from '#shared/domain'
import type { z } from 'zod';

useHead({ title: 'Outcomes' })
definePageMeta({ name: 'Outcomes' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Outcomes').params

const { data: outcomes, refresh, status, error: getOutcomesError } = await useFetch<z.infer<typeof Outcome>[]>(`/api/outcome`, {
    query: { solutionSlug, organizationSlug },
    transform: (data) => data.map((item) => ({
        ...item,
        lastModified: new Date(item.lastModified),
        creationDate: new Date(item.creationDate)
    })).filter((item) => item.reqId !== 'G.3.1') // FIXME: Filter out the default outcome (Context and Objective)
})

if (getOutcomesError.value)
    $eventBus.$emit('page-error', getOutcomesError.value);

const viewSchema = Outcome.pick({
    reqId: true,
    name: true,
    description: true
})

const createSchema = Outcome.pick({
    name: true,
    description: true
})

const editSchema = Outcome.pick({
    id: true,
    reqId: true,
    name: true,
    description: true
})

const onCreate = async (data: z.infer<typeof createSchema>) => {
    await $fetch(`/api/outcome`, {
        method: 'POST',
        body: {
            solutionSlug,
            organizationSlug,
            name: data.name,
            description: data.description
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: z.infer<typeof editSchema>) => {
    await $fetch(`/api/outcome/${data.id}`, {
        method: 'PUT',
        body: {
            solutionSlug,
            organizationSlug,
            name: data.name,
            description: data.description
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/outcome/${id}`, {
        method: 'DELETE',
        body: { solutionSlug, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>

<template>
    <h1>Outcomes</h1>
    <p> {{ Outcome.description }} </p>

    <XDataTable :viewSchema="viewSchema" :createSchema="createSchema" :editSchema="editSchema" :data="outcomes"
        :onCreate="onCreate" :onDelete="onDelete" :onUpdate="onUpdate" :loading="status === 'pending'">
    </XDataTable>
</template>