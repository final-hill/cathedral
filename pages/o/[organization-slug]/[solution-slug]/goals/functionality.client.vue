<script lang="ts" setup>
import { FunctionalBehavior, MoscowPriority } from '~/server/domain/requirements/index';

useHead({ title: 'Functionality' })
definePageMeta({ name: 'Goals Functionality' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Functionality').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

const { data: functionalBehaviors, refresh, status, error: getFunctionalBehaviorsError } = await useFetch<FunctionalBehavior[]>(`/api/functional-behaviors`, {
    query: { solutionId },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
})

if (getFunctionalBehaviorsError.value)
    $eventBus.$emit('page-error', getFunctionalBehaviorsError.value);

const onCreate = async (data: FunctionalBehavior) => {
    await $fetch(`/api/functional-behaviors`, {
        method: 'POST',
        body: {
            ...data,
            solutionId,
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: FunctionalBehavior) => {
    await $fetch(`/api/functional-behaviors/${data.id}`, {
        method: 'PUT',
        body: {
            ...data,
            solutionId,
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/functional-behaviors/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>

<template>
    <p>
        This section describes the Functional Behaviors of the solution.
        These are the features that the solution must have to meet the needs of the users.
        They describe <strong>WHAT</strong> the solution must do and not how it does it.
    </p>

    <XDataTable :viewModel="{ name: 'text', statement: 'text' }" :createModel="{ name: 'text', statement: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', statement: 'text' }" :datasource="functionalBehaviors"
        :on-create="onCreate" :on-update="onUpdate" :on-delete="onDelete" :loading="status === 'pending'">
    </XDataTable>
</template>