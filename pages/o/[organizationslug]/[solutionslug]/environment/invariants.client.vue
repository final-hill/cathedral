<script lang="ts" setup>
import { Invariant } from '#shared/domain'
import type { z } from 'zod'

useHead({ title: 'Invariants' })
definePageMeta({ name: 'Invariants' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Invariants').params

const { data: invariants, refresh, status, error: getInvariantsError } = await useFetch<z.infer<typeof Invariant>[]>(`/api/invariant`, {
    query: { solutionSlug, organizationSlug },
    transform: (data) => data.map((item) => ({
        ...item,
        lastModified: new Date(item.lastModified),
        creationDate: new Date(item.creationDate)
    }))
})

if (getInvariantsError.value)
    $eventBus.$emit('page-error', getInvariantsError.value)

const viewSchema = Invariant.pick({
    reqId: true,
    name: true,
    description: true
})

const createSchema = Invariant.pick({
    name: true,
    description: true
})

const editSchema = Invariant.pick({
    id: true,
    reqId: true,
    name: true,
    description: true
})

const onCreate = async (data: z.infer<typeof createSchema>) => {
    await useFetch(`/api/invariant`, {
        method: 'POST',
        body: {
            name: data.name,
            description: data.description,
            solutionSlug,
            organizationSlug
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async ({ id, ...data }: z.infer<typeof editSchema>) => {
    await useFetch(`/api/invariant/${id}`, {
        method: 'PUT', body: {
            solutionSlug,
            organizationSlug,
            ...data
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await useFetch(`/api/invariant/${id}`, {
        method: 'DELETE',
        body: { solutionSlug, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>

<template>
    <h1> Invariants </h1>
    <p> {{ Invariant.description }} </p>
    <XDataTable :viewSchema="viewSchema" :createSchema="createSchema" :editSchema="editSchema" :data="invariants"
        :onCreate="onCreate" :onDelete="onDelete" :onUpdate="onUpdate" :loading="status === 'pending'">
    </XDataTable>
</template>