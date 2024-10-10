<script lang="ts" setup>
import { EnvironmentComponent } from '~/server/domain/EnvironmentComponent.js';

useHead({ title: 'Components' })
definePageMeta({ name: 'Environment Components' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Environment Components').params,
    { data: solutions, error: getSolutionError } = await useFetch('/api/solutions', {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id,
    { data: environmentComponents, status, refresh, error: getEnvironmentComponentsError } = await useFetch<EnvironmentComponent[]>(`/api/environment-components`, {
        query: { solutionId },
        transform: (data) => data.map((item) => {
            item.lastModified = new Date(item.lastModified)
            return item
        })
    })

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

if (getEnvironmentComponentsError.value)
    $eventBus.$emit('page-error', getEnvironmentComponentsError.value)

const onCreate = async (data: EnvironmentComponent) => {
    await $fetch(`/api/environment-components`, {
        method: 'POST',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/environment-components/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh()
}

const onUpdate = async (data: EnvironmentComponent) => {
    await $fetch(`/api/environment-components/${data.id}`, {
        method: 'PUT',
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
        Environment components are the EXTERNAL elements that the system interacts with.
        These external components expose interfaces that the system uses to communicate with.
    </p>
    <XDataTable :viewModel="{ name: 'text', statement: 'text' }" :createModel="{ name: 'text', statement: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', statement: 'text' }" :datasource="environmentComponents"
        :on-create="onCreate" :on-delete="onDelete" :on-update="onUpdate" :loading="status === 'pending'"
        :organizationSlug="organizationslug" entityName="EnvironmentComponent" :showRecycleBin="true">
    </XDataTable>
</template>