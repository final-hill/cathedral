<script lang="ts" setup>
import { FunctionalBehavior, NonFunctionalBehavior, SystemComponent, Functionality } from '#shared/domain';
import type { z } from 'zod';

useHead({ title: 'Functionality' })
definePageMeta({ name: 'Functionality' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Functionality').params

const { data: components, status, refresh, error: getComponentsError } = await useFetch<z.infer<typeof SystemComponent>[]>(`/api/system-component`, {
    query: { solutionSlug, organizationSlug },
    transform: (data) => data.map((item) => ({
        ...item,
        lastModified: new Date(item.lastModified),
        creationDate: new Date(item.creationDate)
    }))
})

if (getComponentsError.value)
    $eventBus.$emit('page-error', getComponentsError.value)

const fnFunctionalBehaviors = async (componentId: string) =>
    await $fetch<z.infer<typeof FunctionalBehavior>[]>(`/api/functional-behavior`, {
        query: { solutionSlug, componentId, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e));

const fnNonFunctionalBehaviors = async (componentId: string) =>
    await $fetch<z.infer<typeof NonFunctionalBehavior>[]>(`/api/non-functional-behavior`, {
        query: { solutionSlug, componentId, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))

const viewSchema = SystemComponent.pick({
    id: true,
    reqId: true,
    name: true,
    description: true
})

const createSchema = SystemComponent.pick({
    name: true,
    description: true,
    parentComponent: true
})

const editSchema = SystemComponent.pick({
    id: true,
    reqId: true,
    name: true,
    description: true,
    parentComponent: true
})

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
    <h1>Functionality</h1>
    <p>
        {{ Functionality.description }}
    </p>

    <pre> { This section is disabled temporarily. } </pre>
    <!--
    <XDataTable :viewSchema="viewSchema" :createSchema="createSchema" :editSchema="editSchema" :data="systemComponents"
        :onCreate="onCreate" :onDelete="onDelete" :onUpdate="onUpdate" :loading="status === 'pending'">
    </XDataTable>
-->
</template>