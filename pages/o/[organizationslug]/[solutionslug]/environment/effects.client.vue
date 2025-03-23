<script lang="ts" setup>
import type { z } from 'zod'
import { Effect } from '~/shared/domain'

useHead({ title: 'Effects' })
definePageMeta({ name: 'Effects' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Effects').params

const { data: effects, refresh, status, error: getEffectsError } = await useFetch<z.infer<typeof Effect>[]>(`/api/effect`, {
    query: { solutionSlug, organizationSlug },
    transform: (data) => data.map((item) => ({
        ...item,
        creationDate: new Date(item.creationDate),
        lastModified: new Date(item.lastModified)
    }))
})

if (getEffectsError.value)
    $eventBus.$emit('page-error', getEffectsError.value)

const viewSchema = Effect.pick({
    reqId: true,
    name: true,
    description: true
})

const createSchema = Effect.pick({
    name: true,
    description: true
})

const editSchema = Effect.pick({
    id: true,
    reqId: true,
    name: true,
    description: true
})

const onCreate = async (data: z.infer<typeof createSchema>) => {
    await $fetch(`/api/effect`, {
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
    await $fetch(`/api/effect/${id}`, {
        method: 'PUT',
        body: {
            solutionSlug,
            organizationSlug,
            ...data
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/effect/${id}`, {
        method: 'DELETE',
        body: { solutionSlug, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>

<template>
    <h1>Effects</h1>
    <p> {{ Effect.description }} </p>
    <XDataTable :viewSchema="viewSchema" :createSchema="createSchema" :editSchema="editSchema" :data="effects"
        :onCreate="onCreate" :onDelete="onDelete" :onUpdate="onUpdate" :loading="status === 'pending'">
    </XDataTable>
</template>