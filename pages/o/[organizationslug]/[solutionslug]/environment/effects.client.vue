<script lang="ts" setup>
import type { EffectViewModel, SolutionViewModel } from '#shared/models'

useHead({ title: 'Effects' })
definePageMeta({ name: 'Effects' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Effects').params,
    { data: solution, error: getSolutionError } = await useFetch<SolutionViewModel>(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

const { data: effects, refresh, status, error: getEffectsError } = await useFetch<EffectViewModel[]>(`/api/effect`, {
    query: { solutionId, organizationSlug },
    transform: (data) => data.map((item) => ({
        ...item,
        lastModified: new Date(item.lastModified)
    }))
})

if (getEffectsError.value)
    $eventBus.$emit('page-error', getEffectsError.value)

const onCreate = async (data: EffectViewModel) => {
    await $fetch(`/api/effect`, {
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

const onUpdate = async (data: EffectViewModel) => {
    await $fetch(`/api/effect/${data.id}`, {
        method: 'PUT',
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
    await $fetch(`/api/effect/${id}`, {
        method: 'DELETE',
        body: { solutionId, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>

<template>
    <p>
        An Effect is an environment property affected by a System.
        Example: "The running system will cause the temperature of the room to increase."
    </p>
    <XDataTable :viewModel="{ reqId: 'text', name: 'text', description: 'text' }"
        :createModel="{ name: 'text', description: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', description: 'text' }" :datasource="effects" :on-create="onCreate"
        :on-delete="onDelete" :on-update="onUpdate" :loading="status === 'pending'" :organizationSlug="organizationSlug"
        entityName="Effect" :showRecycleBin="true">
    </XDataTable>
</template>