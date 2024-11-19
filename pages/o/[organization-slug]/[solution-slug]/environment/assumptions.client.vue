<script lang="ts" setup>
import { useFetch } from 'nuxt/app';
import type { AssumptionViewModel, SolutionViewModel } from '~/shared/models';

useHead({ title: 'Assumptions' })
definePageMeta({ name: 'Assumptions' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Assumptions').params,
    { data: solution, error: getSolutionError } = await useFetch<SolutionViewModel>(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: assumptions, refresh, status, error: getAssumptionsError } = await useFetch<AssumptionViewModel[]>(`/api/assumption`, {
    query: { solutionId, organizationSlug },
    transform: (data) => data.map((item) => ({
        ...item,
        lastModified: new Date(item.lastModified)
    }))
})

if (getAssumptionsError.value)
    $eventBus.$emit('page-error', getAssumptionsError.value);

const onCreate = async (data: AssumptionViewModel) => {
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

const onUpdate = async (data: AssumptionViewModel) => {
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
    <p>
        An assumption is a property of the environment that is assumed to be true.
        Assumptions are used to simplify the problem and to make it more tractable.
        An example of an assumption would be: "Screen resolution will not change during
        the execution of the program".
    </p>
    <XDataTable :viewModel="{ reqId: 'text', name: 'text', description: 'text' }"
        :createModel="{ name: 'text', description: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', description: 'text' }" :datasource="assumptions" :on-create="onCreate"
        :on-delete="onDelete" :on-update="onUpdate" :loading="status === 'pending'" :organizationSlug="organizationSlug"
        entityName="Assumption" :showRecycleBin="true">
    </XDataTable>
</template>