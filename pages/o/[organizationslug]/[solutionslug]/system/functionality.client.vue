<script lang="ts" setup>
import type { FunctionalBehaviorViewModel, NonFunctionalBehaviorViewModel, SystemComponentViewModel, SolutionViewModel } from '#shared/models';

useHead({ title: 'Functionality' })
definePageMeta({ name: 'Functionality' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Functionality').params,
    { data: solution, error: getSolutionError } = await useFetch<SolutionViewModel>(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

const { data: components, status, refresh, error: getComponentsError } = await useFetch<SystemComponentViewModel[]>(`/api/system-component`, {
    query: { solutionId, organizationSlug },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
}),
    expandedRows = ref({})

if (getComponentsError.value)
    $eventBus.$emit('page-error', getComponentsError.value)

const fnFunctionalBehaviors = async (componentId: string) =>
    await $fetch<FunctionalBehaviorViewModel[]>(`/api/functional-behavior`, {
        query: { solutionId, componentId, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e));

const fnNonFunctionalBehaviors = async (componentId: string) =>
    await $fetch<NonFunctionalBehaviorViewModel[]>(`/api/non-functional-behavior`, {
        query: { solutionId, componentId, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))

const componentSortField = ref<string | undefined>('name')

// const onCreate = async (newData: BehaviorViewModel) => {
//     const b: Omit<Functionality, 'id'> = {
//         name: newData.name,
//         description: newData.description,
//         solutionId,
//         component: newData.component,
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
//         description: newData.description,
//         solutionId,
//         component: newData.component,
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
        v-model:expandedRows="expandedRows" :organizationId="organization.id">
        <template #rows>
            <Column expander />
            <Column field="name" header="Name" sortable>
<template #body="{ data, field }">
                    {{ data[field] }}
                </template>
</Column>
<Column field="description" header="Description">
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