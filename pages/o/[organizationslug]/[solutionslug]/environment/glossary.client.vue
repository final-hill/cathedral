<script lang="ts" setup>
import { GlossaryTerm } from '#shared/domain'
import type { z } from 'zod';

useHead({ title: 'Glossary' })
definePageMeta({ name: 'Glossary' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Glossary').params;

const { data: glossaryTerms, refresh, status, error: getGlossaryTermsError } = await useFetch<z.infer<typeof GlossaryTerm>[]>(`/api/glossary-term`, {
    query: { solutionSlug, organizationSlug },
    transform: (data) => data.map((item) => ({
        ...item,
        lastModified: new Date(item.lastModified),
        creationDate: new Date(item.creationDate)
    }))
})

if (getGlossaryTermsError.value)
    $eventBus.$emit('page-error', getGlossaryTermsError.value)

const viewSchema = GlossaryTerm.pick({
    reqId: true,
    name: true,
    description: true
})

const createSchema = GlossaryTerm.pick({
    name: true,
    description: true
})

const editSchema = GlossaryTerm.pick({
    id: true,
    reqId: true,
    name: true,
    description: true
})

const onCreate = async (data: z.infer<typeof createSchema>) => {
    await $fetch(`/api/glossary-term`, {
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
    await $fetch(`/api/glossary-term/${id}`, {
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
    await $fetch(`/api/glossary-term/${id}`, {
        method: 'DELETE',
        body: { solutionSlug, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh()
}
</script>

<template>
    <h1> Glossary </h1>
    <p> {{ GlossaryTerm.description }} </p>
    <XDataTable :viewSchema="viewSchema" :createSchema="createSchema" :editSchema="editSchema" :data="glossaryTerms"
        :onCreate="onCreate" :onDelete="onDelete" :onUpdate="onUpdate" :loading="status === 'pending'">
    </XDataTable>
</template>