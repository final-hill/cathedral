<script lang="ts" setup>
import { Limit } from '#shared/domain'
import type { z } from 'zod'

useHead({ title: 'Limitations' })
definePageMeta({ name: 'Limitations' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Limitations').params

const { data: limits, status, refresh, error: getLimitsError } = await useFetch<z.infer<typeof Limit>[]>(`/api/limit`, {
    query: { solutionSlug, organizationSlug },
    transform: (data) => data.map((item) => ({
        ...item,
        lastModified: new Date(item.lastModified),
        creationDate: new Date(item.creationDate)
    }))
})

if (getLimitsError.value)
    $eventBus.$emit('page-error', getLimitsError.value)

const viewSchema = Limit.pick({
    reqId: true,
    name: true,
    description: true
})

const createSchema = Limit.pick({
    name: true,
    description: true
})

const editSchema = Limit.pick({
    id: true,
    reqId: true,
    name: true,
    description: true
})

const onCreate = async (data: z.infer<typeof createSchema>) => {
    await $fetch(`/api/limit`, {
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

const onUpdate = async ({ id, ...data }: z.infer<typeof editSchema>) => {
    await $fetch(`/api/limit/${id}`, {
        method: 'PUT', body: {
            solutionSlug,
            organizationSlug,
            ...data
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/limit/${id}`, {
        method: 'DELETE',
        body: { solutionSlug, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>
<template>
    <h1> Limitations </h1>
    <p> {{ Limit.description }} </p>

    <XDataTable :viewSchema="viewSchema" :createSchema="createSchema" :editSchema="editSchema" :data="limits"
        :onCreate="onCreate" :onDelete="onDelete" :onUpdate="onUpdate" :loading="status === 'pending'">
    </XDataTable>
</template>