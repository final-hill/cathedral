<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import { NIL as emptyUuid } from 'uuid';

useHead({ title: 'Roles & Personnel' })
definePageMeta({ name: 'Roles & Personnel' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Roles & Personnel').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

type PersonViewModel = {
    id: string;
    name: string;
    email: string;
}

const { data: personnel, refresh, status, error: getPersonnelError } = await useFetch(`/api/persons`, {
    query: { solutionId }
}),
    emptyPerson: PersonViewModel = { id: emptyUuid, name: '', email: '' };

if (getPersonnelError.value)
    $eventBus.$emit('page-error', getPersonnelError.value)

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'email': { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const onCreate = async (data: PersonViewModel) => {
    await $fetch(`/api/persons`, {
        method: 'POST',
        body: {
            ...data,
            solutionId,
            statement: ''
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh();
}

const onUpdate = async (data: PersonViewModel) => {
    await $fetch(`/api/persons/${data.id}`, {
        method: 'PUT',
        body: {
            ...data,
            solutionId,
            statement: ''
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh();
}

const onDelete = async (id: string) => {
    await $fetch(`/api/persons/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh();
}
</script>
<template>
    <p>
        Roles & Personnel lists the roles and personnel involved in the project
        along with their responsibilities, availability, and contact information.
    </p>

    <XDataTable :datasource="personnel" :empty-record="emptyPerson" :filters="filters" :on-create="onCreate"
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