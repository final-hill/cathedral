<script lang="ts" setup>
import { useFetch } from 'nuxt/app';
import { FilterMatchMode } from 'primevue/api';
import ConstraintCategory from '~/server/domain/requirements/ConstraintCategory';
import { NIL as emptyUuid } from 'uuid';

useHead({ title: 'Constraints' })
definePageMeta({ name: 'Constraints' })

const { solutionslug, organizationslug } = useRoute('Constraints').params,
    { data: solutions } = await useFetch('/api/solutions', {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solution = (solutions.value ?? [])[0],
    solutionId = solution.id,
    { data: constraints, status, refresh } = await useFetch('/api/constraints', {
        query: { solutionId }
    });

type ConstraintViewModel = {
    id: string;
    name: string;
    statement: string;
    category: ConstraintCategory;
}

const constraintCategories = ref<{ id: string, description: string }[]>(
    Object.values(ConstraintCategory).map((value) => ({ id: value, description: value }))
),
    emptyConstraint: ConstraintViewModel = { id: emptyUuid, name: '', statement: '', category: ConstraintCategory.BUSINESS }

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'category': { value: null, matchMode: FilterMatchMode.EQUALS }
});

const onCreate = async (data: ConstraintViewModel) => {
    await $fetch(`/api/constraints`, {
        method: 'POST',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId,
            category: data.category
        }
    })

    refresh()
}

const onDelete = async (id: string) => {
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
            category: data.category
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
        <Column field="category" header="Category" sortable>
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