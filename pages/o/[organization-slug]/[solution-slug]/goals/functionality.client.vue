<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import MoscowPriority from '~/server/domain/requirements/MoscowPriority';
import { NIL as emptyUuid } from 'uuid';

useHead({ title: 'Functionality' })
definePageMeta({ name: 'Goals Functionality' })

const { solutionslug, organizationslug } = useRoute('Functionality').params,
    { data: solutions } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id

type FunctionalBehaviorViewModel = {
    id: string;
    name: string;
    statement: string;
    priority: MoscowPriority;
}

const { data: functionalBehaviors, refresh, status } = await useFetch(`/api/functional-behaviors?solutionId=${solutionId}`),
    emptyFunctionalBehavior: FunctionalBehaviorViewModel = {
        id: emptyUuid,
        name: '',
        statement: '',
        priority: MoscowPriority.MUST
    };

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: FunctionalBehaviorViewModel) => {
    await $fetch('/api/functional-behaviors', {
        method: 'POST',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId,
            priority: MoscowPriority.MUST
        }
    })

    refresh()
}

const onUpdate = async (data: FunctionalBehaviorViewModel) => {
    await $fetch(`/api/functional-behaviors/${data.id}`, {
        method: 'PUT',
        body: {
            id: data.id,
            name: data.name,
            statement: data.statement,
            solutionId,
            priority: data.priority
        }
    })

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/functional-behaviors/${id}`, { method: 'DELETE' })

    refresh()
}
</script>

<template>
    <p>
        This section describes the Functional Behaviors of the solution.
        These are the features that the solution must have to meet the needs of the users.
        They describe <strong>WHAT</strong> the solution must do and not how it does it.
    </p>

    <XDataTable :datasource="functionalBehaviors" :empty-record="emptyFunctionalBehavior" :filters="filters"
        :on-create="onCreate" :on-update="onUpdate" :on-delete="onDelete">
        <Column field="name" header="Function" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                    placeholder="Search by function" />
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