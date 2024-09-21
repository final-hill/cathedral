<script lang="ts" setup>
import mermaid from 'mermaid';
import { StakeholderCategory, StakeholderSegmentation } from '~/server/domain/requirements/index';
import { NIL as emptyUuid } from 'uuid';

useHead({ title: 'Stakeholders' })
definePageMeta({ name: 'Stakeholders' })

const config = useAppConfig(),
    { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Stakeholders').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

type StakeHolderViewModel = {
    id: string;
    name: string;
    statement: string;
    availability: number;
    influence: number;
    category: StakeholderCategory;
    segmentation: StakeholderSegmentation;
}

const { data: stakeholders, refresh, status, error: getStakeholdersError } = await useFetch(`/api/stakeholders`, {
    query: { solutionId }
}),
    categories = ref<{ id: string, description: string }[]>(
        Object.values(StakeholderCategory).map((value) => ({ id: value, description: value }))
    ),
    segmentations = ref<{ id: string, description: string }[]>(
        Object.values(StakeholderSegmentation).map((value) => ({ id: value, description: value }))
    ),
    emptyStakeholder: StakeHolderViewModel = {
        id: emptyUuid,
        name: '',
        statement: '',
        availability: 0,
        influence: 0,
        category: StakeholderCategory.KEY_STAKEHOLDER,
        segmentation: StakeholderSegmentation.VENDOR
    };

if (getStakeholdersError.value)
    $eventBus.$emit('page-error', getStakeholdersError.value);

// watch the stakeholders and re-render the chart
watch(stakeholders, async () => {
    const groupStakeholders = Object.groupBy(stakeholders.value!, ({ segmentation }) => segmentation),
        clientGroup = groupStakeholders.Client ?? [],
        vendorGroup = groupStakeholders.Vendor ?? [];

    clientMap.value!.textContent = chartDefinition(clientGroup, StakeholderSegmentation.CLIENT)
    vendorMap.value!.textContent = chartDefinition(vendorGroup, StakeholderSegmentation.VENDOR)

    await mermaid.run({
        nodes: [clientMap.value!, vendorMap.value!]
    })
});

enum themeMap {
    light = 'default',
    dark = 'dark'
};

mermaid.initialize({
    startOnLoad: false,
    theme: themeMap[config.darkMode]
});

const chartDefinition = (stakeholders: StakeHolderViewModel[], category: StakeholderSegmentation) => `
    quadrantChart
    title ${category}
    x-axis Low Availability --> High Availability
    y-axis Low Infuence --> High Influence
    quadrant-1 "${categories.value[0].id} (Satisfy)"
    quadrant-2 "${categories.value[1].id} (Manage)"
    quadrant-3 "${categories.value[2].id} (Inform)"
    quadrant-4 "${categories.value[3].id} (Monitor)"
    ${stakeholders.map(({ name, availability, influence }) =>
    `"${name}": [${availability / 100}, ${influence / 100}]`)?.join('\n')
    }
`;

const clientMap = ref<HTMLElement>(),
    vendorMap = ref<HTMLElement>();

const onCreate = async (data: StakeHolderViewModel) => {
    await $fetch(`/api/stakeholders`, {
        method: 'POST',
        body: {
            ...data,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: StakeHolderViewModel) => {
    await $fetch(`/api/stakeholders/${data.id}`, {
        method: 'PUT',
        body: {
            ...data,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/stakeholders/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>

<template>
    <p>
        Stakeholders are the categories of people who are affected by the
        problem you are trying to solve. Do not list individuals, but rather
        groups or roles. Example: instead of "Jane Doe", use "Project Manager".
    </p>

    <TabView>
        <TabPanel header="Stakeholders">
            <XDataTable :datasource="stakeholders" :empty-record="emptyStakeholder" :on-create="onCreate"
                :on-update="onUpdate" :on-delete="onDelete" :loading="status === 'pending'">
                <template #rows>
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
                    <Column field="availability" header="Availability" sortable>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputNumber v-model.trim="filterModel.value" @input="filterCallback()"
                                placeholder="(0-100)" />
                        </template>
                        <template #body="{ data, field }">
                            {{ data[field] }}
                        </template>
                    </Column>
                    <Column field="influence" header="Influence" sortable>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputNumber v-model.trim="filterModel.value" @input="filterCallback()"
                                placeholder="(0-100)" />
                        </template>
                        <template #body="{ data, field }">
                            {{ data[field] }}
                        </template>
                    </Column>
                    <Column field="category" header="Category" sortable>
                        <template #filter="{ filterModel, filterCallback }">
                            <select class="p-inputtext p-component" v-model="filterModel.value"
                                @input="filterCallback()">
                                <option v-for="category in categories" :key="category.id" :value="category.id">
                                    {{ category.description }}
                                </option>
                            </select>
                        </template>
                        <template #body="{ data, field }">
                            {{ categories.find(({ id }) => id === data[field])?.description }}
                        </template>
                    </Column>
                    <Column field="segmentation" header="Segmentation" sortable>
                        <template #filter="{ filterModel, filterCallback }">
                            <select class="p-inputtext p-component" v-model="filterModel.value"
                                @input="filterCallback()">
                                <option v-for="segmentation in segmentations" :key="segmentation.id"
                                    :value="segmentation.id">
                                    {{ segmentation.description }}
                                </option>
                            </select>
                        </template>
                        <template #body="{ data, field }">
                            {{ segmentations.find(({ id }) => id === data[field])?.description }}
                        </template>
                    </Column>
                </template>
                <template #createDialog="{ data } : { data: StakeHolderViewModel }">
                    <div class="field grid">
                        <label for="name" class="required col-fixed w-9rem">Name</label>
                        <InputText name="name" v-model.trim="data.name" placeholder="Enter a name" class="col"
                            required />
                    </div>
                    <div class="field grid">
                        <label for="statement" class="required col-fixed w-9rem">Description</label>
                        <InputText name="statement" v-model.trim="data.statement" placeholder="Enter a description"
                            class="col" required />
                    </div>
                    <div class="field grid">
                        <label for="availability" class="required col-fixed w-9rem">Availability</label>
                        <InputNumber :pt="{ input: { root: { name: 'availability', required: true } } }"
                            v-model.trim="data.availability" :min="0" :max="100" placeholder="(0-100)" class="col" />
                    </div>
                    <div class="field grid">
                        <label for="influence" class="required col-fixed w-9rem">Influence</label>
                        <InputNumber :pt="{ input: { root: { name: 'influence', required: true } } }"
                            v-model.trim="data.influence" :min="0" :max="100" placeholder="(0-100)" class="col" />
                    </div>
                    <div class="field grid">
                        <label for="category" class="required col-fixed w-9rem">Category</label>
                        <select class="p-inputtext p-component col" name="category" v-model="data.category" required>
                            <option v-for="category in categories" :key="category.id" :value="category.id">
                                {{ category.description }}
                            </option>
                        </select>
                    </div>
                    <div class="field grid">
                        <label for="segmentation" class="required col-fixed w-9rem">Segmentation</label>
                        <select class="p-inputtext p-component col" name="segmentation" v-model="data.segmentation"
                            required>
                            <option v-for="segmentation in segmentations" :key="segmentation.id"
                                :value="segmentation.id">
                                {{ segmentation.description }}
                            </option>
                        </select>
                    </div>
                </template>
                <template #editDialog="{ data } : { data: StakeHolderViewModel }">
                    <input type="hidden" name="id" v-model.trim="data.id" />
                    <div class="field grid">
                        <label for="name" class="required col-fixed w-9rem">Name</label>
                        <InputText name="name" v-model.trim="data.name" placeholder="Enter a name" class="col"
                            required />
                    </div>
                    <div class="field grid">
                        <label for="statement" class="required col-fixed w-9rem">Description</label>
                        <InputText name="statement" v-model.trim="data.statement" placeholder="Enter a description"
                            class="col" required />
                    </div>
                    <div class="field grid">
                        <label for="availability" class="required col-fixed w-9rem">Availability</label>
                        <InputNumber v-model.trim="data.availability" :min="0" :max="100" placeholder="(0-100)"
                            class="col" :pt="{ input: { root: { name: 'availability', required: true } } }" />
                    </div>
                    <div class="field grid">
                        <label for="influence" class="required col-fixed w-9rem">Influence</label>
                        <InputNumber v-model.trim="data.influence" :min="0" :max="100" placeholder="(0-100)" class="col"
                            :pt="{ input: { root: { name: 'influence', required: true } } }" />
                    </div>
                    <div class="field grid">
                        <label for="category" class="required col-fixed w-9rem">Category</label>
                        <select class="p-inputtext p-component col" name="category" v-model="data.category" required>
                            <option v-for="category in categories" :key="category.id" :value="category.id">
                                {{ category.description }}
                            </option>
                        </select>
                    </div>
                    <div class="field grid">
                        <label for="segmentation" class="required col-fixed w-9rem">Segmentation</label>
                        <select class="p-inputtext p-component col" name="segmentation" v-model="data.segmentation"
                            required>
                            <option v-for="segmentation in segmentations" :key="segmentation.id"
                                :value="segmentation.id">
                                {{ segmentation.description }}
                            </option>
                        </select>
                    </div>
                </template>
            </XDataTable>
        </TabPanel>
        <TabPanel header="Stakeholder Map">
            <section ref="clientMap"></section>
            <section ref="vendorMap"></section>
        </TabPanel>
    </TabView>
</template>