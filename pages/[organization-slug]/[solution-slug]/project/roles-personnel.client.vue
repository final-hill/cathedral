<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import type Person from '~/server/domain/requirements/Person';
import { type Uuid, emptyUuid } from '~/server/domain/Uuid';

useHead({ title: 'Roles & Personnel' })
definePageMeta({ name: 'Roles & Personnel' })

const solutionSlug = useRoute().params.solutionSlug as string,
    { data: solutions } = useFetch(`/api/solutions?slug=${solutionSlug}`),
    solutionId = solutions.value?.[0].id

type PersonnelViewModel = Pick<Person, 'id' | 'name' | 'email'>;

const { data: personnel, refresh, status } = useFetch(`/api/persons?solutionId=${solutionId}`),
    emptyPersonnel: PersonnelViewModel = { id: emptyUuid, name: '', email: '' };

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'email': { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const onCreate = async (data: PersonnelViewModel) => {
    await $fetch(`/api/persons`, {
        method: 'POST', body: {
            ...data,
            solutionId,
            statement: ''
        }
    });

    refresh();
}

const onUpdate = async (data: PersonnelViewModel) => {
    await $fetch(`/api/persons/${data.id}`, {
        method: 'PUT', body: {
            ...data,
            solutionId,
            statement: ''
        }
    });

    refresh();
}

const onDelete = async (id: Uuid) => {
    await $fetch(`/api/persons/${id}`, { method: 'DELETE' })
    refresh();
}
</script>
<template>
    <p>
        Roles & Personnel lists the roles and personnel involved in the project
        along with their responsibilities, availability, and contact information.
    </p>

    <XDataTable :datasource="personnel" :empty-record="emptyPersonnel" :filters="filters" :on-create="onCreate"
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
        <Column field="email" header="Email" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by name" />
            </template>
            <template #body="{ data, field }">
                {{ data[field] }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required />
            </template>
        </Column>
    </XDataTable>
</template>