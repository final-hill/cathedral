<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import type Behavior from '../../domain/Behavior';
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import FunctionalRequirementRepository from '../../data/FunctionalBehaviorRepository';
import NonFunctionalRequirementRepository from '../../data/NonFunctionalBehaviorRepository';
import FunctionalRequirementInteractor from '../../application/FunctionalBehaviorInteractor';
import NonFunctionalRequirementInteractor from '../../application/NonFunctionalBehaviorInteractor';
import SolutionInteractor from '~/modules/solution/application/SolutionInteractor';
import ComponentRepository from '~/data/ComponentRepository';
import ComponentInteractor from '~/application/ComponentInteractor';
import type Component from '~/domain/Component';

useHead({ title: 'Functionality' })

const slug = useRoute().params.solutionSlug as string,
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0],
    solutionId = solution.id,
    componentInteractor = new ComponentInteractor(new ComponentRepository()),
    functionalRequirementInteractor = new FunctionalRequirementInteractor(new FunctionalRequirementRepository()),
    nonFunctionalRequirementInteractor = new NonFunctionalRequirementInteractor(new NonFunctionalRequirementRepository());

type ComponentViewModel = Pick<Component, 'id' | 'name' | 'statement' | 'solutionId'>
    & { behaviors: BehaviorViewModel[] };

type BehaviorViewModel = Pick<Behavior, 'id' | 'name' | 'statement' | 'solutionId' | 'componentId'>
    & { category: 'Functional' | 'Non-functional' };

const components = ref<ComponentViewModel[]>(await refreshComponents()),
    expandedRows = ref(),
    emptyBehavior = (componentId: Uuid): BehaviorViewModel => ({
        id: emptyUuid,
        name: '',
        statement: '',
        solutionId,
        category: 'Functional',
        componentId
    });

const refreshComponents = async (): Promise<ComponentViewModel[]> => {
    return Promise.all((await componentInteractor.getAll({ solutionId }))
        .map(async component => {
            const functionalReqs = (await functionalRequirementInteractor.getAll({ componentId: component.id }))
                .map<BehaviorViewModel>(fr => ({ ...fr, category: 'Functional' }));
            const nonFunctionalReqs = (await nonFunctionalRequirementInteractor.getAll({ componentId: component.id }))
                .map<BehaviorViewModel>(nfr => ({ ...nfr, category: 'Non-functional' }));

            return {
                id: component.id,
                name: component.name,
                statement: component.statement,
                solutionId: component.solutionId,
                behaviors: [...functionalReqs, ...nonFunctionalReqs]
            }
        }))
}

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
    const b = {
        name: newData.name,
        statement: newData.statement,
        solutionId,
        componentId: newData.componentId,
        property: ''
    }

    if (newData.category === 'Functional')
        await functionalRequirementInteractor.create(b)
    else
        await nonFunctionalRequirementInteractor.create(b)

    components.value = await refreshComponents()
}

const onUpdate = async (newData: BehaviorViewModel) => {
    const b = {
        id: newData.id,
        name: newData.name,
        statement: newData.statement,
        solutionId,
        componentId: newData.componentId,
        property: ''
    }

    if (newData.category === 'Functional')
        await functionalRequirementInteractor.update(b)
    else
        await nonFunctionalRequirementInteractor.update(b)


    components.value = await refreshComponents()
}

const onDelete = async (id: Uuid) => {
    await Promise.all([
        functionalRequirementInteractor.delete(id),
        nonFunctionalRequirementInteractor.delete(id)
    ])

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