<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import type Obstacle from '~/server/domain/Obstacle';
import { type Uuid, emptyUuid } from '~/server/domain/Uuid';

useHead({ title: 'Obstacles' })
definePageMeta({ name: 'Obstacles' })

const slug = useRoute().params.slug as string,
    { data: solutions } = await useFetch(`/api/solutions?slug=${slug}`),
    solutionId = solutions.value?.[0].id;

type ObstacleViewModel = Pick<Obstacle, 'id' | 'name' | 'statement'>;

const { data: obstacles, refresh, status } = useFetch(`/api/obstacles?solutionId=${solutionId}`),
    emptyObstacle: ObstacleViewModel = { id: emptyUuid, name: '', statement: '' };

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: ObstacleViewModel) => {
    await $fetch(`/api/obstacles`, {
        method: 'POST',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId
        }
    })

    refresh()
}

const onUpdate = async (data: ObstacleViewModel) => {
    await $fetch(`/api/obstacles/${data.id}`, {
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
    await $fetch(`/api/obstacles/${id}`, { method: 'DELETE' })

    refresh()
}
</script>

<template>
    <p>
        Obstacles are the challenges that prevent the goals from being achieved.
    </p>

    <XDataTable :datasource="obstacles" :empty-record="emptyObstacle" :filters="filters" :on-create="onCreate"
        :on-update="onUpdate" :on-delete="onDelete">
        <Column field="name" header="Name" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by name" />
            </template>
            <template #body="{ data }">
                {{ data.name }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required />
            </template>
        </Column>
        <Column field="statement" header="Description">
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                    placeholder="Search by Description" />
            </template>
            <template #body="{ data }">
                {{ data.statement }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" />
            </template>
        </Column>
    </XDataTable>
</template>