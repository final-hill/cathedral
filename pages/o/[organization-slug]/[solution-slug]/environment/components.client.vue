<script lang="ts" setup>
import { EnvironmentComponent } from '~/domain/requirements/EnvironmentComponent.js';

useHead({ title: 'Components' })
definePageMeta({ name: 'Environment Components' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Environment Components').params,
    { data: solutions, error: getSolutionError } = await useFetch('/api/solution', {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id,
    { data: environmentComponents, status, refresh, error: getEnvironmentComponentsError } = await useFetch<EnvironmentComponent[]>(`/api/environment-component`, {
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
    await $fetch(`/api/environment-component`, {
        method: 'POST',
        body: {
            name: data.name,
            description: data.description,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/environment-component/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh()
}

const onUpdate = async (data: EnvironmentComponent) => {
    await $fetch(`/api/environment-component/${data.id}`, {
        method: 'PUT',
        body: {
            name: data.name,
            description: data.description,
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
    <XDataTable :viewModel="{ name: 'text', description: 'text' }" :createModel="{ name: 'text', description: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', description: 'text' }" :datasource="environmentComponents"
        :on-create="onCreate" :on-delete="onDelete" :on-update="onUpdate" :loading="status === 'pending'"
        :organizationSlug="organizationslug" entityName="EnvironmentComponent" :showRecycleBin="true">
    </XDataTable>
</template>