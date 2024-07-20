<script lang="ts" setup>
import { useFetch } from 'nuxt/app';
import { FilterMatchMode } from 'primevue/api';
import type Constraint from '~/server/domain/Constraint';
import ConstraintCategory from '~/server/domain/Constraint';
import { type Uuid, emptyUuid } from '~/server/domain/Uuid';

useHead({ title: 'Constraints' })
definePageMeta({ name: 'Constraints' })

const slug = useRoute().params.slug as string,
    { data: solutions } = await useFetch(`/api/solutions?slug=${slug}`),
    solution = (solutions.value ?? [])[0],
    solutionId = solution.id,
    { data: constraints, status, refresh } = useFetch(`/api/constraints?solutionId=${solutionId}`)


type ConstraintViewModel = Pick<Constraint, 'id' | 'name' | 'statement' | 'categoryId'>;

const constraintCategories = ref<ConstraintCategory[]>(
    Object.values(ConstraintCategory)
),
    emptyConstraint: ConstraintViewModel = { id: emptyUuid, name: '', statement: '', categoryId: 'BUSINESS' }

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'categoryId': { value: null, matchMode: FilterMatchMode.EQUALS }
});

const onCreate = async (data: ConstraintViewModel) => {
    await $fetch(`/api/constraints`, {
        method: 'POST',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId,
            categoryId: data.categoryId
        }
    })

    refresh()
}

const onDelete = async (id: Uuid) => {
    await $fetch(`/api/constraints/${id}`, { method: 'DELETE' })
    refresh()
}

const onUpdate = async (data: ConstraintViewModel) => {
    await $fetch(`/api/constraints/${data.id}`, {
        method: 'PUT',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId,
            categoryId: data.categoryId
        }
    })
    refresh()
}
</script>

<template>
    <p>
        Environmental constraints are the limitations and obligations that
        the environment imposes on the project and system.
    </p>
    <XDataTable :datasource="constraints" :empty-record="emptyConstraint" :filters="filters" :on-create="onCreate"
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
        <Column field="categoryId" header="Category" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model="filterModel.value" :options="constraintCategories" optionLabel="description"
                    optionValue="id" @change="filterCallback()" />
            </template>
            <template #body="{ data, field }">
                {{ constraintCategories.find(o => o.id === data[field])?.description }}
            </template>
            <template #editor="{ data, field }">
                <Dropdown v-model="data[field]" :options="constraintCategories" optionLabel="description"
                    optionValue="id" required="true" />
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