<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import { NIL as emptyUuid } from 'uuid';

useHead({ title: 'Limitations' })
definePageMeta({ name: 'Limitations' })

const { solutionslug, organizationslug } = useRoute('Limitations').params,
    { data: solutions } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id

type LimitViewModel = {
    id: string;
    name: string;
    statement: string;
}

const { data: limits, status, refresh } = await useFetch(`/api/limits?solutionId=${solutionId}`),
    emptyLimit: LimitViewModel = { id: emptyUuid, name: '', statement: '' };

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: LimitViewModel) => {
    await $fetch(`/api/limits`, {
        method: 'POST',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId
        }
    })

    refresh()
}

const onUpdate = async (data: LimitViewModel) => {
    await $fetch(`/api/limits/${data.id}`, {
        method: 'PUT', body: {
            id: data.id,
            name: data.name,
            statement: data.statement,
            solutionId
        }
    })

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/limits/${id}`, { method: 'DELETE' })

    refresh()
}
</script>
<template>
    <p>
        Limitations are the constraints on functionality. They describe What that is out-of-scope and excluded.
        Example: "Providing an interface to the user to change the color of the background is out-of-scope."
    </p>

    <XDataTable :datasource="limits" :empty-record="emptyLimit" :filters="filters" :on-create="onCreate"
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
                <InputText v-model.trim="data[field]" required="true" />
            </template>
        </Column>
    </XDataTable>
</template>