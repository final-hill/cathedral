<script lang="ts" setup>
import { MoscowPriority } from '~/server/domain/requirements/index';
import { NIL as emptyUuid } from 'uuid';

useHead({ title: 'Functionality' })
definePageMeta({ name: 'Functionality' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Functionality').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solution = solutions.value?.[0]!,
    solutionId = solution.id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

type BehaviorViewModel = {
    id: string;
    name: string;
    statement: string;
    solutionId: string;
    priority: MoscowPriority;
}

const { data: components, status, refresh, error: getComponentsError } = await useFetch(`/api/system-components`, {
    query: { solutionId }
}),
    expandedRows = ref({}),
    emptyBehavior = (componentid: string): BehaviorViewModel => ({
        id: emptyUuid,
        name: '',
        statement: '',
        solutionId,
        priority: MoscowPriority.MUST
    });

if (getComponentsError.value)
    $eventBus.$emit('page-error', getComponentsError.value)

const fnFunctionalBehaviors = async (componentId: string) =>
    await $fetch(`/api/functional-behaviors`, {
        query: { solutionId, componentId }
    }).catch((e) => $eventBus.$emit('page-error', e));

const fnNonFunctionalBehaviors = async (componentId: string) =>
    await $fetch(`/api/non-functional-behaviors`, {
        query: { solutionId, componentId }
    }).catch((e) => $eventBus.$emit('page-error', e))

const componentSortField = ref<string | undefined>('name')

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

// const onRowExpand = (event: any) => {
//     console.log('expanded', event)
// }

// const onRowCollapse = (event: any) => {
//     console.log('collapsed', event)
// }
</script>
<template>
    <p>
        This section defines the functionality (behavior) of the system.
        It includes both functional and non-functional requirements of system components.
    </p>

    <!--
    <XDataTable :datasource="components" :sortField="componentSortField" :sortOrder="1"
        v-model:expandedRows="expandedRows">
        <template #rows>
            <Column expander />
            <Column field="name" header="Name" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                        placeholder="Search by name" />
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
                    <select class="p-inputtext p-component"  v-model="filterModel.value" @change="filterCallback()">
                        <option value="">Search by Component</option>
                        <option v-for="component in components" :key="component.id" :value="component.id">
                            {{ component.name }}
                        </option>
                    </select>
                </template>
    <template #body="{ data, field }">
                    {{ components!
                        .filter(c => c.id !== emptyUuid)
                        .find(c => c.id === data[field])?.name }}
                </template>
</Column>
</template>
<template #expansion="{ data }">
            <h5>Functional Behaviors for {{ data.name }}</h5>
            <h5> Non-Functional Behaviors for {{ data.name }}</h5>
        </template>
<template #empty>Components must exist before functionality can be defined.</template>
<template #loading>Loading components...</template>
</XDataTable>
-->
</template>