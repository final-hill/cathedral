<script lang="ts" setup>
import { type Uuid, emptyUuid } from '~/server/domain/Uuid';
import { FilterMatchMode } from 'primevue/api';
import { useFetch } from 'nuxt/app';

useHead({ title: 'Assumptions' })
definePageMeta({ name: 'Assumptions' })

const slug = useRoute().params.slug as string,
    { data: solutions } = await useFetch(`/api/solutions?slug=${slug}`),
    solutionId = solutions.value?.at(0)?.id as Uuid;

type AssumptionViewModel = {
    id: Uuid;
    name: string;
    statement: string;
}

const { data: assumptions, refresh, status } = await useFetch(`/api/assumptions/?solutionId=${solutionId}`),
    emptyAssumption = { id: emptyUuid, name: '', statement: '' };

const filters = ref<Record<string, { value: any, matchMode: string }>>({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: AssumptionViewModel) => {
    await $fetch(`/api/assumptions/`, {
        method: 'post',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId
        }
    })

    refresh()
}

const onDelete = async (id: Uuid) => {
    await $fetch(`/api/assumptions/${id}`, { method: 'delete' })

    refresh()
}

const onUpdate = async (data: AssumptionViewModel) => {
    await $fetch(`/api/assumptions/${data.id}`, {
        method: 'put',
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
        An assumption is a property of the environment that is assumed to be true.
        Assumptions are used to simplify the problem and to make it more tractable.
        An example of an assumption would be: "Screen resolution will not change during
        the execution of the program".
    </p>
    <XDataTable :datasource="assumptions" :filters="filters" :empty-record="emptyAssumption" :on-create="onCreate"
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