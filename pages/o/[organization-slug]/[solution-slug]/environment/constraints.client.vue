<script lang="ts" setup>
import { useFetch } from 'nuxt/app';
import { ConstraintCategory } from '~/domain/requirements/ConstraintCategory.js';

useHead({ title: 'Constraints' })
definePageMeta({ name: 'Constraints' })

interface ConstraintViewModel {
    id: string;
    reqId: string;
    name: string;
    description: string;
    category: ConstraintCategory;
    lastModified: Date;
}

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Constraints').params,
    { data: solutions, error: getSolutionError } = await useFetch('/api/solution', {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solution = (solutions.value ?? [])[0],
    solutionId = solution.id,
    { data: constraints, status, refresh, error: getConstraintsError } = await useFetch<ConstraintViewModel[]>(`/api/constraint`, {
        query: { solutionId },
        transform: (data) => data.map((item) => {
            item.lastModified = new Date(item.lastModified)
            return item
        })
    });

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

if (getConstraintsError.value)
    $eventBus.$emit('page-error', getConstraintsError.value)

const onCreate = async (data: ConstraintViewModel) => {
    await $fetch(`/api/constraint`, {
        method: 'POST',
        body: {
            name: data.name,
            description: data.description,
            category: data.category,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/constraint/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh()
}

const onUpdate = async (data: ConstraintViewModel) => {
    await $fetch(`/api/constraint/${data.id}`, {
        method: 'PUT',
        body: {
            name: data.name,
            description: data.description,
            category: data.category,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh()
}
</script>

<template>
    <p>
        Environmental constraints are the limitations and obligations that
        the environment imposes on the project and system.
    </p>
    <XDataTable :viewModel="{ reqId: 'text', name: 'text', category: 'text', description: 'text' }"
        :createModel="{ name: 'text', category: Object.values(ConstraintCategory), description: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', category: Object.values(ConstraintCategory), description: 'text' }"
        :datasource="constraints" :on-create="onCreate" :on-delete="onDelete" :on-update="onUpdate"
        :loading="status === 'pending'" :organizationSlug="organizationslug" entityName="Constraint"
        :showRecycleBin="true">
    </XDataTable>
</template>