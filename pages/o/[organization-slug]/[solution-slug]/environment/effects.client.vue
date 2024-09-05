<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import { NIL as emptyUuid } from 'uuid';

useHead({ title: 'Effects' })
definePageMeta({ name: 'Effects' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Effects').params,
    { data: solutions, error: getSolutionError } = await useFetch('/api/solutions', {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id!

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

type EffectViewModel = {
    id: string;
    name: string;
    statement: string;
}

const { data: effects, refresh, status, error: getEffectsError } = await useFetch(`/api/effects`, {
    query: { solutionId }
}),
    emptyEffect: EffectViewModel = { id: emptyUuid, name: '', statement: '' }

if (getEffectsError.value)
    $eventBus.$emit('page-error', getEffectsError.value)

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: EffectViewModel) => {
    await $fetch(`/api/effects`, {
        method: 'POST',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh()
}

const onUpdate = async (data: EffectViewModel) => {
    await $fetch(`/api/effects/${data.id}`, {
        method: 'PUT',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/effects/${id}`, {
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
    <XDataTable :datasource="effects" :empty-record="emptyEffect" :filters="filters" :on-create="onCreate"
        :on-delete="onDelete" :on-update="onUpdate">
        <Column field="name" header="Name" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by name" />
            </template>
            <template #body="{ data }">
                {{ data.name }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required="true" />
            </template>
        </Column>
        <Column field="statement" header="Description">
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                    placeholder="Search by description" />
            </template>
            <template #body="{ data }">
                {{ data.statement }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required="true" />
            </template>
        </Column>
    </XDataTable>
</template>