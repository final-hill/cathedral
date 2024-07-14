<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import type SystemComponent from '~/server/domain/SystemComponent';
import { type Uuid, emptyUuid } from '~/server/domain/Uuid';

useHead({ title: 'Components' })
definePageMeta({ name: 'System Components' })

const slug = useRoute().params.slug as string,
    { data: solutions } = await useFetch(`/api/solutions?slug=${slug}`),
    solutionId = solutions.value?.[0].id;

type SystemComponentViewModel = Pick<SystemComponent, 'id' | 'name' | 'statement' | 'parentComponentId'>;

const { data: systemComponents, refresh, status } = useFetch(`/api/system-components?solutionId=${solutionId}`),
    emptyComponent: SystemComponentViewModel = {
        id: emptyUuid,
        name: '',
        statement: '',
        parentComponentId: emptyUuid
    };

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'parentComponentId': { value: null, matchMode: FilterMatchMode.EQUALS }
})

const onCreate = async (data: SystemComponentViewModel) => {
    await $fetch('/api/system-components', {
        method: 'POST',
        body: { ...data, solutionId }
    })

    refresh()
}

const onUpdate = async (data: SystemComponentViewModel) => {
    await $fetch(`/api/system-components/${data.id}`, {
        method: 'PUT',
        body: { data, solutionId }
    })

    refresh()
}

const onDelete = async (id: Uuid) => {
    await $fetch(`/api/system-components/${id}`, {
        method: 'DELETE'
    })

    refresh()
}
</script>
<template>
    <p>
        Components describe the structure of the system as a list or hierarchy.
    </p>
    <XDataTable :datasource="systemComponents" :filters="filters" :emptyRecord="emptyComponent" :onCreate="onCreate"
        :onUpdate="onUpdate" :onDelete="onDelete">
        <Column field="name" header="Name" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by name" />
            </template>
            <template #body="{ data, field }">
                {{ data[field] }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required="true" placeholder="Enter a name" />
            </template>
        </Column>
        <Column field="statement" header="Description">
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                    placeholder="Search by description" />
            </template>
            <template #body="{ data, field }">
                {{ data[field] }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required="true" placeholder="Enter a description" />
            </template>
        </Column>
        <Column field="parentComponentId" header="Parent">
            <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name" optionValue="id"
                    :options="systemComponents!" placeholder="Search by Component" />
            </template>
            <template #body="{ data, field }">
                {{ systemComponents?.find(c => c.id === data[field])?.name }}
            </template>
            <template #editor="{ data, field }">
                <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id"
                    :options="systemComponents!.filter(c => c.id !== data.id)" placeholder="Select a Component"
                    showClear />
            </template>
        </Column>
    </XDataTable>
</template>