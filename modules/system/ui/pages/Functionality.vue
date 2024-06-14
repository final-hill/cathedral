<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import SystemRepository from '../../data/SystemRepository';
import SystemComponentRepository from '../../data/SystemComponentRepository';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import GetSystemBySolutionIdUseCase from '../../application/GetSystemBySolutionIdUseCase';
import GetSystemComponentsUseCase from '../../application/GetSystemComponentsUseCase';
import type SystemComponent from '../../domain/SystemComponent';
import type Behavior from '../../domain/Behavior';
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import FunctionalRequirementRepository from '../../data/FunctionalRequirementRepository';
import NonFunctionalRequirementRepository from '../../data/NonFunctionalRequirementRepository';
import FunctionalRequirementInteractor from '../../application/FunctionalRequirementInteractor';
import NonFunctionalRequirementInteractor from '../../application/NonFunctionalRequirementInteractor';

useHead({
    title: 'Functionality'
})

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    systemRepository = new SystemRepository(),
    componentRepository = new SystemComponentRepository(),
    functionalRequirementsRepository = new FunctionalRequirementRepository(),
    nonFunctionalRequirementsRepository = new NonFunctionalRequirementRepository(),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    solution = await getSolutionBySlugUseCase.execute(slug),
    getSystemBySolutionIdUseCase = new GetSystemBySolutionIdUseCase(systemRepository),
    system = solution?.id && await getSystemBySolutionIdUseCase.execute(solution.id),
    getComponentsUseCase = new GetSystemComponentsUseCase(componentRepository),
    functionalRequirementInteractor = new FunctionalRequirementInteractor(functionalRequirementsRepository),
    nonFunctionalRequirementInteractor = new NonFunctionalRequirementInteractor(nonFunctionalRequirementsRepository);

if (!solution) {
    router.push({ name: 'Solutions' })
} else {
    if (!system)
        router.push({ name: 'System', params: { solutionSlug: slug } });
}

type SystemComponentViewModel = Pick<SystemComponent, 'id' | 'name' | 'statement' | 'parentId' | 'systemId'>
    & { behaviors: BehaviorViewModel[] };

type BehaviorViewModel = Pick<Behavior, 'id' | 'name' | 'statement' | 'parentId'>
    & { category: 'Functional' | 'Non-functional' };

const components = ref<SystemComponentViewModel[]>([]),
    expandedRows = ref(),
    emptyBehavior = (parentId: Uuid): BehaviorViewModel => ({
        id: emptyUuid,
        name: '',
        statement: '',
        parentId,
        category: 'Functional'
    });

const refreshComponents = async () => {
    return Promise.all((await getComponentsUseCase.execute(system!.id))
        .map(async c => {
            const functionalReqs: BehaviorViewModel[] = (await functionalRequirementInteractor.getByParentId(c.id))
                .map(fr => ({ ...fr, category: 'Functional' }));
            const nonFunctionalReqs: BehaviorViewModel[] = (await nonFunctionalRequirementInteractor.getByParentId(c.id))
                .map(nfr => ({ ...nfr, category: 'Non-functional' }));

            return {
                ...c,
                behaviors: [...functionalReqs, ...nonFunctionalReqs]
            }
        })
    );
}

onMounted(async () => {
    components.value = await refreshComponents()
})

const componentSortField = ref<string | undefined>('name')

const componentFilters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'parentId': { value: null, matchMode: FilterMatchMode.EQUALS }
})

const behaviorFilters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'category': { value: null, matchMode: FilterMatchMode.EQUALS }
})

const onCreate = async (newData: BehaviorViewModel) => {
    await functionalRequirementInteractor.create({
        ...newData,
        solutionId: solution!.id
    })
    components.value = await refreshComponents()
}

const onUpdate = async (newData: BehaviorViewModel) => {
    await functionalRequirementInteractor.update({
        ...newData,
        solutionId: solution!.id
    })
    components.value = await refreshComponents()
}

const onDelete = async (id: Uuid) => {
    await functionalRequirementInteractor.delete(id)
    components.value = await refreshComponents()
}
</script>
<template>
    <p>
        This section defines the functionality (behavior) of the system.
        It includes both functional and non-functional requirements of system components.
    </p>

    <DataTable :value="components" dataKey="id" :filters="componentFilters" filterDisplay="row"
        :globalFilterFields="Object.keys(componentFilters)" :sortField="componentSortField" :sortOrder="1"
        v-model:expandedRows="expandedRows">
        <Column expander />
        <Column field="name" header="Name" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by name" />
            </template>
            <template #body="{ data, field }">
                {{ data[field] }}
            </template>
        </Column>
        <Column field="statement" header="Description">
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                    placeholder="Search by description" />
            </template>
            <template #body="{ data, field }">
                {{ data[field] }}
            </template>
        </Column>
        <Column field="parentId" header="Parent">
            <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name" optionValue="id"
                    :options="components" placeholder="Search by Component" />
            </template>
            <template #body="{ data, field }">
                {{ components
                    .filter(c => c.id !== emptyUuid)
                    .find(c => c.id === data[field])?.name }}
            </template>
        </Column>
        <template #expansion="{ data }">
            <h5>Behaviors for {{ data.name }}</h5>

            <XDataTable class="w-10 ml-8" :datasource="data.behaviors" :emptyRecord="emptyBehavior(data.id)"
                :filters="behaviorFilters" :onCreate="onCreate" :onDelete="onDelete" :onUpdate="onUpdate">
                <Column field="name" header="Name" sortable>
                    <template #body="{ data, field }">
                        {{ data[field] }}
                    </template>
                    <template #editor="{ data, field }">
                        <InputText v-model.trim="data[field]" required="true" placeholder="Enter a name" />
                    </template>
                </Column>
                <Column field="statement" header="Description">
                    <template #body="{ data, field }">
                        {{ data[field] }}
                    </template>
                    <template #editor="{ data, field }">
                        <InputText v-model.trim="data[field]" required="true" placeholder="Enter a description" />
                    </template>
                </Column>
                <Column field="category" header="Category">
                    <template #body="{ data, field }">
                        {{ data[field] }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model.trim="data[field]" :options="['Functional', 'Non-functional']"
                            placeholder="Select a category" />
                    </template>
                </Column>
            </XDataTable>
        </template>
        <template #empty>Components must exist before functionality can be defined.</template>
        <template #loading>Loading components...</template>
    </DataTable>
</template>