<script lang="ts" setup>
import type { GlossaryTermViewModel, SolutionViewModel } from '#shared/models'

useHead({ title: 'Glossary' })
definePageMeta({ name: 'Glossary' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Glossary').params,
    { data: solution, error: getSolutionError } = await useFetch<SolutionViewModel>(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: glossaryTerms, refresh, status, error: getGlossaryTermsError } = await useFetch<GlossaryTermViewModel[]>(`/api/glossary-term`, {
    query: { solutionId, organizationSlug },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
})

if (getGlossaryTermsError.value)
    $eventBus.$emit('page-error', getGlossaryTermsError.value)

const onCreate = async (data: GlossaryTermViewModel) => {
    await $fetch(`/api/glossary-term`, {
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

const onUpdate = async (data: GlossaryTermViewModel) => {
    await $fetch(`/api/glossary-term/${data.id}`, {
        method: 'PUT',
        body: {
            id: data.id,
            name: data.name,
            description: data.description,
            solutionId,
            organizationSlug
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/glossary-term/${id}`, {
        method: 'DELETE',
        body: { solutionId, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh()
}
</script>

<template>
    <p>
        A Glossary is a list of terms in a particular domain of knowledge with the definitions for those terms.
    </p>
    <XDataTable :viewModel="{ reqId: 'text', name: 'text', description: 'text' }"
        :createModel="{ name: 'text', description: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', description: 'text' }" :datasource="glossaryTerms"
        :on-create="onCreate" :on-delete="onDelete" :on-update="onUpdate" :loading="status === 'pending'"
        :organizationSlug="organizationSlug" entityName="GlossaryTerm" :showRecycleBin="true">
    </XDataTable>
</template>