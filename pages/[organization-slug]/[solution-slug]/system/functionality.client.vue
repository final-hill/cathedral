<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import MoscowPriority from '~/server/domain/requirements/MoscowPriority';
import { NIL as emptyUuid } from 'uuid';

useHead({ title: 'Functionality' })
definePageMeta({ name: 'Functionality' })

const { solutionslug } = useRoute('Functionality').params,
    { data: solutions } = await useFetch(`/api/solutions?slug=${solutionslug}`),
    solution = solutions.value?.[0]!,
    solutionId = solution.id;

type BehaviorViewModel = {
    id: string;
    name: string;
    statement: string;
    solutionId: string;
    priority: MoscowPriority;
}

const { data: components, status, refresh } = await useFetch(`/api/system-components?solutionId=${solutionId}`),
    expandedRows = ref({}),
    emptyBehavior = (componentid: string): BehaviorViewModel => ({
        id: emptyUuid,
        name: '',
        statement: '',
        solutionId,
        priority: MoscowPriority.MUST
    });

const fnFunctionalBehaviors = async (componentId: string) =>
    (await useFetch(`/api/functional-behaviors?componentId=${componentId}`)).data;

const fnNonFunctionalBehaviors = async (componentId: string) =>
    (await useFetch(`/api/non-functional-behaviors?componentId=${componentId}`)).data;

const componentSortField = ref<string | undefined>('name')

const componentFilters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'parentId': { value: null, matchMode: FilterMatchMode.EQUALS }
})

const behaviorFilters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS }
})

// const onCreate = async (newData: BehaviorViewModel) => {
//     const b: Omit<Properties<Functionality>, 'id'> = {
//         name: newData.name,
//         statement: newData.statement,
//         solutionId,
//         componentId: newData.componentId,
//         priority: 'MUST'
//     }

//     if (newData.category === 'Functional')
//         await functionalRequirementInteractor.create(b)
//     else
//         await nonFunctionalRequirementInteractor.create(b)

//     refresh()
// }

// const onUpdate = async (newData: BehaviorViewModel) => {
//     const b: Properties<Functionality> = {
//         id: newData.id,
//         name: newData.name,
//         statement: newData.statement,
//         solutionId,
//         componentId: newData.componentId,
//         priority: newData.priority
//     }

//     if (newData.category === 'Functional')
//         await functionalRequirementInteractor.update(b)
//     else
//         await nonFunctionalRequirementInteractor.update(b)

//     refresh()
// }

// const onDelete = async (id: string) => {
//     await Promise.all([
//         functionalRequirementInteractor.delete(id),
//         nonFunctionalRequirementInteractor.delete(id)
//     ])

//     refresh()
// }

const onRowExpand = (event: any) => {
    console.log('expanded', event)
}

const onRowCollapse = (event: any) => {
    console.log('collapsed', event)
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
                    :options="components!" placeholder="Search by Component" />
            </template>
            <template #body="{ data, field }">
                {{ components!
                    .filter(c => c.id !== emptyUuid)
                    .find(c => c.id === data[field])?.name }}
            </template>
        </Column>
        <template #expansion="{ data }">
            <h5>Functional Behaviors for {{ data.name }}</h5>

            <!--
            <XDataTable class="w-10 ml-8" :datasource="fbs" :emptyRecord="emptyBehavior(data.id)"
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
</XDataTable>

-->

            <h5> Non-Functional Behaviors for {{ data.name }}</h5>
        </template>
        <template #empty>Components must exist before functionality can be defined.</template>
        <template #loading>Loading components...</template>
    </DataTable>
</template>