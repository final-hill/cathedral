<script lang="ts" setup>
import { useFetch } from 'nuxt/app';
import { Assumption } from '~/server/domain/Assumption.js';

useHead({ title: 'Assumptions' })
definePageMeta({ name: 'Assumptions' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Assumptions').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            organizationSlug: organizationslug,
            slug: solutionslug
        }
    }),
    solutionId = solutions.value?.at(0)?.id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: assumptions, refresh, status, error: getAssumptionsError } = await useFetch<Assumption[]>(`/api/assumptions`, {
    query: { solutionId },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
})

if (getAssumptionsError.value)
    $eventBus.$emit('page-error', getAssumptionsError.value);

const onCreate = async (data: Assumption) => {
    await $fetch(`/api/assumptions`, {
        method: 'post',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/assumptions/${id}`, {
        method: 'delete',
        body: { solutionId }
    })
        .catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: Assumption) => {
    await $fetch(`/api/assumptions/${data.id}`, {
        method: 'put',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId
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
    <XDataTable :viewModel="{ name: 'text', statement: 'text' }" :createModel="{ name: 'text', statement: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', statement: 'text' }" :datasource="assumptions" :on-create="onCreate"
        :on-delete="onDelete" :on-update="onUpdate" :loading="status === 'pending'">
    </XDataTable>
</template>