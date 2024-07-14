<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import Outcome from '~/server/domain/Outcome';
import { type Uuid, emptyUuid } from '~/server/domain/Uuid';

useHead({ title: 'Outcomes' })
definePageMeta({ name: 'Outcomes' })

const slug = useRoute().params.slug as string,
    { data: solutions } = await useFetch(`/api/solutions?slug=${slug}`),
    solutionId = solutions.value?.[0].id;

type OutcomeViewModel = Pick<Outcome, 'id' | 'name' | 'statement'>;

const { data: outcomes, refresh, status } = useFetch(`/api/outcomes?solutionId=${solutionId}`),
    emptyOutcome: OutcomeViewModel = { id: emptyUuid, name: '', statement: '' };

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: OutcomeViewModel) => {
    await $fetch(`/api/outcomes`, {
        method: 'POST',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId
        }
    })

    refresh()
}

const onUpdate = async (data: OutcomeViewModel) => {
    await $fetch(`/api/outcomes/${data.id}`, {
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
    await $fetch<Outcome>(`/api/outcomes/${id}`, { method: 'DELETE' })

    refresh()
}
</script>

<template>
    <p>
        Outcomes are the expected benefits, capabilities, or processes
        of the system that will be achieved by the associated project.
    </p>

    <XDataTable :datasource="outcomes" :filters="filters" :empty-record="emptyOutcome" :onCreate="onCreate"
        :onUpdate="onUpdate" :onDelete="onDelete">
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