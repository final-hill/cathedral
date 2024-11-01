<script lang="ts" setup>

interface EffectViewModel {
    id: string;
    reqId: string;
    name: string;
    description: string;
    lastModified: Date;
};

useHead({ title: 'Effects' })
definePageMeta({ name: 'Effects' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Effects').params,
    { data: solutions, error: getSolutionError } = await useFetch('/api/solution', {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id!

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

const { data: effects, refresh, status, error: getEffectsError } = await useFetch<EffectViewModel[]>(`/api/effect`, {
    query: { solutionId },
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
            solutionId
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
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/effect/${id}`, {
        method: 'DELETE',
        body: { solutionId }
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
        :on-delete="onDelete" :on-update="onUpdate" :loading="status === 'pending'" :organizationSlug="organizationslug"
        entityName="Effect" :showRecycleBin="true">
    </XDataTable>
</template>