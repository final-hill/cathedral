<script lang="ts" setup>
import mermaid from 'mermaid';
import { Stakeholder, StakeholderCategory, StakeholderSegmentation } from '#shared/domain';
import type { z } from 'zod';

useHead({ title: 'Stakeholders' })
definePageMeta({ name: 'Stakeholders' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Stakeholders').params,
    { data: solution, error: getSolutionError } = await useFetch(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: stakeholders, refresh: refreshStakeholders, status, error: getStakeholdersError } = await useFetch<z.infer<typeof Stakeholder>[]>(`/api/stakeholder`, {
    query: { solutionId, organizationSlug },
    transform: (data) => data.map((item) => ({
        ...item,
        lastModified: new Date(item.lastModified),
        creationDate: new Date(item.creationDate)
    }))
})

const tabs = [
    { label: 'Stakeholders', slot: 'stakeholders' },
    { label: 'Stakeholder Map', slot: 'stakeholder-map' }
]

if (getStakeholdersError.value)
    $eventBus.$emit('page-error', getStakeholdersError.value);

const viewSchema = Stakeholder.pick({
    name: true,
    description: true,
    category: true,
    segmentation: true,
    availability: true,
    influence: true
})

const createSchema = Stakeholder.pick({
    name: true,
    description: true,
    category: true,
    segmentation: true,
    availability: true,
    influence: true
})

const editSchema = Stakeholder.pick({
    id: true,
    name: true,
    description: true,
    category: true,
    segmentation: true,
    availability: true,
    influence: true
})

const colorMode = useColorMode()

enum themeMap {
    light = 'default',
    dark = 'dark'
};

mermaid.initialize({
    startOnLoad: false,
    theme: themeMap[colorMode.value as keyof typeof themeMap]
});

const chartDefinition = (stakeholders: z.infer<typeof Stakeholder>[], category: StakeholderSegmentation) => `
    quadrantChart
    title ${category}
    x-axis Low Availability --> High Availability
    y-axis Low Infuence --> High Influence
    quadrant-1 "${StakeholderCategory['Key Stakeholder']} (Satisfy)"
    quadrant-2 "${StakeholderCategory['Shadow Influencer']} (Manage)"
    quadrant-3 "${StakeholderCategory['Fellow Traveler']} (Inform)"
    quadrant-4 "${StakeholderCategory['Observer']} (Monitor)"
    ${stakeholders.map(({ name, availability, influence }) =>
    `"${name}": [${availability / 100}, ${influence / 100}]`)?.join('\n')
    }
`;

const clientMap = ref<HTMLElement>(),
    vendorMap = ref<HTMLElement>();

const renderChart = async () => {
    const groupStakeholders = Object.groupBy(stakeholders.value!, ({ segmentation }) => segmentation ?? 'unknown'),
        clientGroup = groupStakeholders.Client ?? [],
        vendorGroup = groupStakeholders.Vendor ?? [];

    clientMap.value!.textContent = chartDefinition(clientGroup, StakeholderSegmentation['Client'])
    vendorMap.value!.textContent = chartDefinition(vendorGroup, StakeholderSegmentation['Vendor'])

    await mermaid.run({
        nodes: [clientMap.value!, vendorMap.value!]
    })
}

watch(stakeholders, renderChart);

const onCreate = async (data: z.infer<typeof createSchema>) => {
    await $fetch(`/api/stakeholder`, {
        method: 'POST',
        body: {
            name: data.name,
            description: data.description,
            category: data.category,
            segmentation: data.segmentation,
            availability: Number(data.availability),
            influence: Number(data.influence),
            solutionId,
            organizationSlug
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refreshStakeholders()
}

const onUpdate = async (data: z.infer<typeof editSchema>) => {
    await $fetch(`/api/stakeholder/${data.id}`, {
        method: 'PUT',
        body: {
            name: data.name,
            description: data.description,
            category: data.category,
            segmentation: data.segmentation,
            availability: Number(data.availability),
            influence: Number(data.influence),
            solutionId,
            organizationSlug
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refreshStakeholders()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/stakeholder/${id}`, {
        method: 'DELETE',
        body: { solutionId, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refreshStakeholders()
}
</script>

<template>
    <h1>Stakeholders</h1>
    <p> {{ Stakeholder.description }} </p>

    <UTabs :items="tabs" @update:open="refreshStakeholders">
        <template #stakeholders="{ item }">
            <XDataTable :viewSchema="viewSchema" :createSchema="createSchema" :editSchema="editSchema"
                :data="stakeholders" :onCreate="onCreate" :onDelete="onDelete" :onUpdate="onUpdate"
                :loading="status === 'pending'">
            </XDataTable>
        </template>
        <template #stakeholder-map="{ item }">
            <section ref="clientMap"></section>
            <section ref="vendorMap"></section>
        </template>
    </UTabs>
</template>