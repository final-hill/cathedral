<script lang="ts" setup>
import { ReqType, Requirement, Stakeholder, StakeholderCategory, StakeholderSegmentation } from '#shared/domain';
import type { z } from 'zod';

useHead({ title: 'Stakeholders' })
definePageMeta({ name: 'Stakeholders', middleware: 'auth' })

const { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Stakeholders').params

const tabs = [
    { label: 'Stakeholders', slot: 'stakeholders' },
    { label: 'Stakeholder Map', slot: 'stakeholder-map' }
]

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

const activeStakeholders = ref<z.infer<typeof Stakeholder>[]>([]);

const handleActiveItems = (items: z.infer<typeof Requirement>[]) => {
    activeStakeholders.value = items as z.infer<typeof Stakeholder>[];
    renderChart();
};

const renderChart = async () => {
    const groupStakeholders = Object.groupBy(activeStakeholders.value, ({ segmentation }) => segmentation ?? 'unknown'),
        clientGroup = groupStakeholders.Client ?? [],
        vendorGroup = groupStakeholders.Vendor ?? [];

    clientMap.value = chartDefinition(clientGroup, StakeholderSegmentation['Client']);
    vendorMap.value = chartDefinition(vendorGroup, StakeholderSegmentation['Vendor']);
};

watch(activeStakeholders, renderChart);
renderChart();
</script>

<template>
    <h1>G.7 Stakeholders</h1>
    <p> {{ Stakeholder.description }} </p>

    <UTabs :items="tabs" @update:open="renderChart">
        <template #stakeholders>
            <XWorkflow :organization-slug="organizationSlug" :req-type="ReqType.STAKEHOLDER"
                :solution-slug="solutionSlug" @workflow-active-items="handleActiveItems" />
        </template>
        <template #stakeholder-map>
            <Mermaid :value="clientMap" />
            <Mermaid :value="vendorMap" />
        </template>
    </UTabs>
</template>