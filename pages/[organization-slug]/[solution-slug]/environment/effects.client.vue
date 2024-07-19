<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import type Effect from '~/server/domain/requirements/Effect';
import { type Uuid, emptyUuid } from '~/server/domain/Uuid';

useHead({ title: 'Effects' })
definePageMeta({ name: 'Effects' })

const solutionSlug = useRoute().params.solutionSlug as string,
    { data: solutions } = await useFetch(`/api/solutions?slug=${solutionSlug}`),
    solutionId = solutions.value?.[0].id!

type EffectViewModel = Pick<Effect, 'id' | 'name' | 'statement'>;

const { data: effects, refresh, status } = await useFetch(`/api/effects?solutionId=${solutionId}`),
    emptyEffect: EffectViewModel = { id: emptyUuid, name: '', statement: '' }

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: EffectViewModel) => {
    await $fetch('/api/effects', {
        method: 'POST', body: {
            name: data.name,
            statement: data.statement,
            solutionId
        }
    })
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
    })

    refresh()
}

const onDelete = async (id: Uuid) => {
    await $fetch(`/api/effects/${id}`, { method: 'DELETE' })

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