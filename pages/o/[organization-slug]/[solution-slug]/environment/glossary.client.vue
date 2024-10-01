<script lang="ts" setup>
import { GlossaryTerm } from '~/server/domain/requirements/GlossaryTerm';

useHead({ title: 'Glossary' })
definePageMeta({ name: 'Glossary' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Glossary').params,
    { data: solutions, error: getSolutionError } = await useFetch('/api/solutions', {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: glossaryTerms, refresh, status, error: getGlossaryTermsError } = await useFetch<GlossaryTerm[]>(`/api/glossary-terms`, {
    query: { solutionId },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
})

if (getGlossaryTermsError.value)
    $eventBus.$emit('page-error', getGlossaryTermsError.value)

const onCreate = async (data: GlossaryTerm) => {
    await $fetch(`/api/glossary-terms`, {
        method: 'POST',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: GlossaryTerm) => {
    await $fetch(`/api/glossary-terms/${data.id}`, {
        method: 'PUT',
        body: {
            id: data.id,
            name: data.name,
            statement: data.statement,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/glossary-terms/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh()
}
</script>

<template>
    <p>
        A Glossary is a list of terms in a particular domain of knowledge with the definitions for those terms.
    </p>
    <XDataTable :viewModel="{ name: 'text', statement: 'text' }" :createModel="{ name: 'text', statement: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', statement: 'text' }" :datasource="glossaryTerms" :on-create="onCreate"
        :on-delete="onDelete" :on-update="onUpdate" :loading="status === 'pending'">
    </XDataTable>
</template>