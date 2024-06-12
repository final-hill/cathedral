<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import EnvironmentRepository from '../../data/EnvironmentRepository';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import GetEnvironmentBySolutionIdUseCase from '../../application/GetEnvironmentBySolutionIdUseCase';
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import ConstraintRepository from '../../data/ConstraintRepository';
import GetConstraintsUseCase from '../../application/GetConstraintsUseCase';
import CreateConstraintUseCase from '../../application/CreateConstraintUseCase';
import UpdateConstraintUseCase from '../../application/UpdateConstraintUseCase';
import DeleteConstraintUseCase from '../../application/DeleteConstraintUseCase';
import type Constraint from '../../domain/Constraint';
import { ConstraintCategory } from '../../domain/Constraint';

useHead({
    title: 'Constraints'
})

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    environmentRepository = new EnvironmentRepository(),
    constraintRepository = new ConstraintRepository(),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    solution = await getSolutionBySlugUseCase.execute(slug),
    getEnvironmentBySolutionIdUseCase = new GetEnvironmentBySolutionIdUseCase(environmentRepository),
    environment = solution?.id && await getEnvironmentBySolutionIdUseCase.execute(solution.id),
    getConstraintsUseCase = new GetConstraintsUseCase(constraintRepository),
    createConstraintUseCase = new CreateConstraintUseCase(environmentRepository, constraintRepository),
    updateConstraintUseCase = new UpdateConstraintUseCase(constraintRepository),
    deleteConstraintUseCase = new DeleteConstraintUseCase(environmentRepository, constraintRepository);

if (!solution) {
    router.push({ name: 'Solutions' });
} else {
    if (!environment)
        router.push({ name: 'Environment', params: { solutionSlug: slug } });
}

type ConstraintViewModel = Pick<Constraint, 'id' | 'name' | 'statement' | 'category'>;

const constraints = ref<ConstraintViewModel[]>([]),
    emptyConstraint = { id: emptyUuid, name: '', statement: '', category: ConstraintCategory.BusinessRule },
    categories = ref<ConstraintCategory[]>(Object.values(ConstraintCategory))

onMounted(async () => {
    constraints.value = await getConstraintsUseCase.execute(environment!.id) ?? []
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'category': { value: null, matchMode: FilterMatchMode.EQUALS }
});

const onCreate = async (data: ConstraintViewModel) => {
    const newId = await createConstraintUseCase.execute({
        parentId: environment!.id,
        name: data.name,
        statement: data.statement,
        category: data.category
    })

    constraints.value = await getConstraintsUseCase.execute(environment!.id) ?? []
}

const onDelete = async (id: Uuid) => {
    constraints.value = constraints.value.filter(o => o.id !== id)
    await deleteConstraintUseCase.execute(id)
}

const onUpdate = async (data: ConstraintViewModel) => {
    await updateConstraintUseCase.execute(data)
    constraints.value = await getConstraintsUseCase.execute(environment!.id) ?? []
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
                <Dropdown v-model="filterModel.value" :options="categories" @input="filterCallback()" />
            </template>
            <template #body="{ data, field }">
                {{ data[field] }}
            </template>
            <template #editor="{ data, field }">
                <Dropdown v-model="data[field]" :options="categories" required="true" />
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