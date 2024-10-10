<script lang="ts" setup>
import { FunctionalBehavior } from '~/server/domain/FunctionalBehavior.js';
import { NonFunctionalBehavior } from '~/server/domain/NonFunctionalBehavior.js';
import { SystemComponent } from '~/server/domain/SystemComponent.js';

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

const { data: components, status, refresh, error: getComponentsError } = await useFetch<SystemComponent[]>(`/api/system-components`, {
    query: { solutionId },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
}),
    expandedRows = ref({})

if (getComponentsError.value)
    $eventBus.$emit('page-error', getComponentsError.value)

const fnFunctionalBehaviors = async (componentId: string) =>
    await $fetch<FunctionalBehavior[]>(`/api/functional-behaviors`, {
        query: { solutionId, componentId }
    }).catch((e) => $eventBus.$emit('page-error', e));

const fnNonFunctionalBehaviors = async (componentId: string) =>
    await $fetch<NonFunctionalBehavior[]>(`/api/non-functional-behaviors`, {
        query: { solutionId, componentId }
    }).catch((e) => $eventBus.$emit('page-error', e))

const componentSortField = ref<string | undefined>('name')

// const onCreate = async (newData: BehaviorViewModel) => {
//     const b: Omit<Functionality, 'id'> = {
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
//     const b: Functionality = {
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

    <pre> { This section is disabled temporarily. } </pre>
    <!--
    <XDataTable :datasource="components" :sortField="componentSortField" :sortOrder="1"
        v-model:expandedRows="expandedRows" :show-history="true" :organizationId="organization.id">
        <template #rows>
            <Column expander />
            <Column field="name" header="Name" sortable>
<template #body="{ data, field }">
                    {{ data[field] }}
                </template>
</Column>
<Column field="statement" header="Description">
    <template #body="{ data, field }">
                    {{ data[field] }}
                </template>
</Column>
<Column field="parent" header="Parent">
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