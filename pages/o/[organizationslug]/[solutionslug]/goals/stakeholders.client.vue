<script lang="ts" setup>
import { Stakeholder, StakeholderCategory, StakeholderSegmentation } from '#shared/domain';
import type { z } from 'zod';

useHead({ title: 'Stakeholders' })
definePageMeta({ name: 'Stakeholders' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Stakeholders').params

const { data: stakeholders, refresh: refreshStakeholders, status, error: getStakeholdersError } = await useFetch<z.infer<typeof Stakeholder>[]>(`/api/stakeholder`, {
    query: { solutionSlug, organizationSlug },
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
    reqId: true,
    name: true,
    description: true,
    category: true,
    segmentation: true
})

const computeInterestAndInfluence = (category: StakeholderCategory) => {
    switch (category) {
        case StakeholderCategory['Fellow Traveler']:
            return { interest: 25, influence: 25 };
        case StakeholderCategory['Observer']:
            return { interest: 75, influence: 25 };
        case StakeholderCategory['Shadow Influencer']:
            return { interest: 25, influence: 75 };
        case StakeholderCategory['Key Stakeholder']:
            return { interest: 75, influence: 75 };
        default:
            return { interest: 0, influence: 0 };
    }
}

const createSchema = Stakeholder.pick({
    name: true,
    description: true,
    category: true,
    segmentation: true
})

const editSchema = Stakeholder.pick({
    id: true,
    reqId: true,
    name: true,
    description: true,
    category: true,
    segmentation: true
})

const chartDefinition = (stakeholders: z.infer<typeof Stakeholder>[], category: StakeholderSegmentation) => `
    quadrantChart
    title ${category}
    x-axis Low Interest --> High Interest
    y-axis Low Infuence --> High Influence
    quadrant-1 "${StakeholderCategory['Key Stakeholder']} (Satisfy)"
    quadrant-2 "${StakeholderCategory['Shadow Influencer']} (Manage)"
    quadrant-3 "${StakeholderCategory['Fellow Traveler']} (Inform)"
    quadrant-4 "${StakeholderCategory['Observer']} (Monitor)"
    ${stakeholders.map(({ name, interest, influence }) =>
    `"${name}": [${interest / 100}, ${influence / 100}]`)?.join('\n')
    }
`;

const clientMap = ref<string>(''),
    vendorMap = ref<string>('');

const renderChart = async () => {
    const groupStakeholders = Object.groupBy(stakeholders.value!, ({ segmentation }) => segmentation ?? 'unknown'),
        clientGroup = groupStakeholders.Client ?? [],
        vendorGroup = groupStakeholders.Vendor ?? [];

    clientMap.value = chartDefinition(clientGroup, StakeholderSegmentation['Client'])
    vendorMap.value = chartDefinition(vendorGroup, StakeholderSegmentation['Vendor'])
}

watch(stakeholders, renderChart);
renderChart();

const onCreate = async (data: z.infer<typeof createSchema>) => {
    const { interest, influence } = computeInterestAndInfluence(data.category);
    await $fetch(`/api/stakeholder`, {
        method: 'POST',
        body: {
            name: data.name,
            description: data.description,
            category: data.category,
            segmentation: data.segmentation,
            interest,
            influence,
            solutionSlug,
            organizationSlug
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refreshStakeholders()
}

const onUpdate = async ({ id, ...data }: z.infer<typeof editSchema>) => {
    const { interest, influence } = computeInterestAndInfluence(data.category);

    await $fetch(`/api/stakeholder/${id}`, {
        method: 'PUT',
        body: {
            ...data,
            interest,
            influence,
            solutionSlug,
            organizationSlug
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refreshStakeholders()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/stakeholder/${id}`, {
        method: 'DELETE',
        body: { solutionSlug, organizationSlug }
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
            <Mermaid :value="clientMap" />
            <Mermaid :value="vendorMap" />
        </template>
    </UTabs>
</template>