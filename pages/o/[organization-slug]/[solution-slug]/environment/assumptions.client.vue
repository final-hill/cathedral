<script lang="ts" setup>
import { NIL as emptyUuid } from 'uuid';
import { FilterMatchMode } from 'primevue/api';
import { useFetch } from 'nuxt/app';

useHead({ title: 'Assumptions' })
definePageMeta({ name: 'Assumptions' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Assumptions').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            organizationSlug: organizationslug,
            slug: solutionslug
        }
    }),
    solutionId = solutions.value?.at(0)?.id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

type AssumptionViewModel = {
    id: string;
    name: string;
    statement: string;
}

const { data: assumptions, refresh, status, error: getAssumptionsError } = await useFetch(`/api/assumptions/?solutionId=${solutionId}`),
    emptyAssumption = { id: emptyUuid, name: '', statement: '' };

if (getAssumptionsError.value)
    $eventBus.$emit('page-error', getAssumptionsError.value);

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
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/assumptions/${id}`, { method: 'delete' })
        .catch((e) => $eventBus.$emit('page-error', e))

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
    }).catch((e) => $eventBus.$emit('page-error', e))

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