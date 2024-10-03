<script lang="ts" setup>
import { useFetch } from 'nuxt/app';
import { Constraint } from '~/server/domain/Constraint.js';
import { ConstraintCategory } from '~/server/domain/ConstraintCategory.js';

useHead({ title: 'Constraints' })
definePageMeta({ name: 'Constraints' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Constraints').params,
    { data: solutions, error: getSolutionError } = await useFetch('/api/solutions', {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solution = (solutions.value ?? [])[0],
    solutionId = solution.id,
    { data: constraints, status, refresh, error: getConstraintsError } = await useFetch<Constraint[]>(`/api/constraints`, {
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

const onCreate = async (data: Constraint) => {
    await $fetch(`/api/constraints`, {
        method: 'POST',
        body: {
            name: data.name,
            statement: data.statement,
            category: data.category,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/constraints/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh()
}

const onUpdate = async (data: Constraint) => {
    await $fetch(`/api/constraints/${data.id}`, {
        method: 'PUT',
        body: {
            name: data.name,
            statement: data.statement,
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
    <XDataTable :viewModel="{ name: 'text', category: 'text' }"
        :createModel="{ name: 'text', category: Object.values(ConstraintCategory), statement: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', category: Object.values(ConstraintCategory), statement: 'text' }"
        :datasource="constraints" :on-create="onCreate" :on-delete="onDelete" :on-update="onUpdate"
        :loading="status === 'pending'">
    </XDataTable>
</template>