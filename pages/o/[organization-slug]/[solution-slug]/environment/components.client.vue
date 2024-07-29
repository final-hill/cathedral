<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import { NIL as emptyUuid } from 'uuid';

useHead({ title: 'Components' })
definePageMeta({ name: 'Environment Components' })

const { solutionslug } = useRoute('Environment Components').params,
    { data: solutions } = await useFetch('/api/solutions', { query: { slug: solutionslug } }),
    solutionId = solutions.value?.[0].id,
    { data: environmentComponents, status, refresh } = await useFetch('/api/environment-components', {
        query: { solutionId }
    }),
    emptyComponent = { id: emptyUuid, name: '', statement: '' }

type EnvironmentComponentViewModel = {
    id: string;
    name: string;
    statement: string;
}

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: EnvironmentComponentViewModel) => {
    await $fetch(`/api/environment-components`, {
        method: 'POST',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId
        }
    })

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/environment-components/${id}`, { method: 'DELETE' })
    refresh()
}

const onUpdate = async (data: EnvironmentComponentViewModel) => {
    await $fetch(`/api/environment-components/${data.id}`, {
        method: 'PUT',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId
        }
    })
    refresh()
}
</script>

<template>
    <p>
        Environment components are the EXTERNAL elements that the system interacts with.
        These external components expose interfaces that the system uses to communicate with.
    </p>
    <XDataTable :datasource="environmentComponents" :empty-record="emptyComponent" :filters="filters"
        :on-create="onCreate" :on-delete="onDelete" :on-update="onUpdate">
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