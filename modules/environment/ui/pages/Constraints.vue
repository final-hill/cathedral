<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import ConstraintRepository from '../../data/ConstraintRepository';
import type Constraint from '../../domain/Constraint';
import SolutionInteractor from '~/modules/solution/application/SolutionInteractor';
import ConstraintCategoryRepository from '../../data/ConstraintCategoryRepository';
import ConstraintInteractor from '../../application/ConstraintInteractor';
import type ConstraintCategory from '../../domain/ConstraintCategory';
import ConstraintCategoryInteractor from '../../application/ConstraintCategoryInteractor';

useHead({ title: 'Constraints' })

const slug = useRoute().params.solutionSlug as string,
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0],
    solutionId = solution.id,
    constraintInteractor = new ConstraintInteractor(new ConstraintRepository()),
    constraintCategoryInteractor = new ConstraintCategoryInteractor(new ConstraintCategoryRepository())

type ConstraintViewModel = Pick<Constraint, 'id' | 'name' | 'statement' | 'categoryId'>;
type ConstraintCategoryModel = Pick<ConstraintCategory, 'id' | 'name'>;

const constraints = ref<ConstraintViewModel[]>(await constraintInteractor.getAll({ solutionId })),
    constraintCategories = ref<ConstraintCategoryModel[]>(await constraintCategoryInteractor.getAll()),
    emptyConstraint: ConstraintViewModel = { id: emptyUuid, name: '', statement: '', categoryId: emptyUuid }

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'categoryId': { value: null, matchMode: FilterMatchMode.EQUALS }
});

const onCreate = async (data: ConstraintViewModel) => {
    const newId = await constraintInteractor.create({
        ...data,
        solutionId,
        property: ''
    })

    constraints.value = await constraintInteractor.getAll({ solutionId })
}

const onDelete = async (id: Uuid) => {
    await constraintInteractor.delete(id)
    constraints.value = constraints.value.filter(o => o.id !== id)
}

const onUpdate = async (data: ConstraintViewModel) => {
    await constraintInteractor.update({
        ...data,
        solutionId,
        property: ''
    })
    constraints.value = await constraintInteractor.getAll({ solutionId })
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
                <Dropdown v-model="filterModel.value" :options="constraintCategories" optionLabel="name"
                    optionValue="id" @change="filterCallback()" />
            </template>
            <template #body="{ data, field }">
                {{ constraintCategories.find(o => o.id === data[field])?.name }}
            </template>
            <template #editor="{ data, field }">
                <Dropdown v-model="data[field]" :options="constraintCategories" optionLabel="name" optionValue="id"
                    required="true" />
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