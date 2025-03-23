<script lang="ts" setup>
import { Person } from '#shared/domain'
import type { z } from 'zod'

useHead({ title: 'Roles & Personnel' })
definePageMeta({ name: 'Roles & Personnel' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Roles & Personnel').params

const { data: personnel, refresh, status, error: getPersonnelError } = await useFetch<z.infer<typeof Person>[]>(`/api/person`, {
    query: { solutionSlug, organizationSlug },
    transform: (data) => data.map((item) => ({
        ...item,
        lastModified: new Date(item.lastModified),
        creationDate: new Date(item.creationDate)
    }))
})

if (getPersonnelError.value)
    $eventBus.$emit('page-error', getPersonnelError.value)

const viewSchema = Person.pick({
    reqId: true,
    name: true,
    email: true
})

const createSchema = Person.pick({
    name: true,
    email: true
})

const editSchema = Person.pick({
    id: true,
    name: true,
    email: true
})

const onCreate = async (data: z.infer<typeof createSchema>) => {
    await $fetch(`/api/person`, {
        method: 'POST',
        body: {
            name: data.name ?? 'Anonymous',
            email: data.email ?? 'anonymous@example.com',
            solutionSlug,
            organizationSlug,
            description: ''
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh();
}

const onUpdate = async ({ id, ...data }: z.infer<typeof editSchema>) => {
    await $fetch(`/api/person/${id}`, {
        method: 'PUT',
        body: {
            solutionSlug,
            organizationSlug,
            ...data
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh();
}

const onDelete = async (id: string) => {
    await $fetch(`/api/person/${id}`, {
        method: 'DELETE',
        body: { solutionSlug, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh();
}
</script>
<template>
    <h1> Roles &amp; Personnel </h1>
    <p> {{ Person.description }} </p>

    <XDataTable :viewSchema="viewSchema" :createSchema="createSchema" :editSchema="editSchema" :data="personnel"
        :onCreate="onCreate" :onDelete="onDelete" :onUpdate="onUpdate" :loading="status === 'pending'">
    </XDataTable>
</template>