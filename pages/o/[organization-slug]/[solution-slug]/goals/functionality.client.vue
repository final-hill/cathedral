<script lang="ts" setup>
import { MoscowPriority } from '~/domain/requirements/MoscowPriority.js';
import type { FunctionalBehaviorViewModel, SolutionViewModel } from '~/shared/models';

useHead({ title: 'Functionality' })
definePageMeta({ name: 'Goals Functionality' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Functionality').params,
    { data: solution, error: getSolutionError } = await useFetch<SolutionViewModel>(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

const { data: functionalBehaviors, refresh, status, error: getFunctionalBehaviorsError } = await useFetch<FunctionalBehaviorViewModel[]>(`/api/functional-behavior`, {
    query: { solutionId, organizationSlug },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
})

if (getFunctionalBehaviorsError.value)
    $eventBus.$emit('page-error', getFunctionalBehaviorsError.value);

const onCreate = async (data: FunctionalBehaviorViewModel) => {
    await $fetch(`/api/functional-behavior`, {
        method: 'POST',
        body: {
            ...data,
            solutionId,
            organizationSlug,
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: FunctionalBehaviorViewModel) => {
    await $fetch(`/api/functional-behavior/${data.id}`, {
        method: 'PUT',
        body: {
            ...data,
            solutionId,
            organizationSlug,
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/functional-behavior/${id}`, {
        method: 'DELETE',
        body: { solutionId, organizationSlug }
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

    <XDataTable :viewModel="{ reqId: 'text', name: 'text', description: 'text' }"
        :createModel="{ name: 'text', description: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', description: 'text' }" :datasource="functionalBehaviors"
        :on-create="onCreate" :on-update="onUpdate" :on-delete="onDelete" :loading="status === 'pending'"
        :organizationSlug="organizationSlug" entityName="FunctionalBehavior" :showRecycleBin="true">
    </XDataTable>
</template>