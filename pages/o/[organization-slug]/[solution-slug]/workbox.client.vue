<script lang="ts" setup>
import snakeCaseToTitle from '~/utils/snakeCaseToTitle.js';
import camelCaseToTitle from '~/utils/camelCaseToTitle.js';
import type { DataTableRowExpandEvent, DataTableRowCollapseEvent, DataTableExpandedRows } from 'primevue/datatable';
import type { ReqType } from '~/domain/requirements/ReqType.js';

interface RequirementViewModel {
    id: number;
    name: string;
    description: string;
    lastModified: Date;
    modifiedBy: { name: string };
    follows: RequirementViewModel[];
    solution: { id: number };
    req_type: ReqType;
    isSilence: boolean;
}

interface ParsedRequirementViewModel extends RequirementViewModel { }

useHead({ title: 'Workbox' });
definePageMeta({ name: 'Workbox' });

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Workbox').params,
    { data: solutions, error: solutionError } = await useFetch('/api/solution', {
        query: {
            organizationSlug: organizationslug,
            slug: solutionslug
        }
    }),
    solution = solutions.value![0];

const { data: parsedRequirements, error: parsedRequirementsError, refresh } = await useFetch<ParsedRequirementViewModel[]>('/api/parse-requirement', {
    method: 'get',
    query: { solutionId: solution.id },
    transform: (data: ParsedRequirementViewModel[]) => data.map((parsedRequirement) => {
        parsedRequirement.lastModified = new Date(parsedRequirement.lastModified)
        return parsedRequirement;
    })
});

if (solutionError.value)
    $eventBus.$emit('page-error', solutionError.value);

if (parsedRequirementsError.value)
    $eventBus.$emit('page-error', parsedRequirementsError.value);

type DataRows = Record<string, { isLoading: boolean, data: Partial<Record<ReqType, RequirementViewModel[]>> }>

const expandedRows = ref<DataTableExpandedRows>({}),
    dataRows = ref<DataRows>({})

const onItemApprove = async (item: RequirementViewModel) => {
    await $fetch(`/api/${snakeCaseToSlug(item.req_type)}/${item.id}`, {
        // @ts-ignore: method not recognized
        method: 'put',
        body: { solutionId: solution.id, isSilence: false }
    });
    await refresh();
}

const onItemDelete = async (item: RequirementViewModel) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`))
        return
    await $fetch(`/api/${snakeCaseToSlug(item.req_type)}/${item.id}`, {
        // @ts-ignore: method not recognized
        method: 'delete',
        body: { solutionId: solution.id }
    });
    await refresh();
}

const onItemUpdate = async (item: RequirementViewModel) => {
    alert(`UPDATE ${item.req_type} not implemented`)
}

const onRowExpand = async ({ data }: DataTableRowExpandEvent) => {
    dataRows.value[data.id] = { isLoading: true, data: {} };
    dataRows.value[data.id].data = await $fetch<DataRows>(`/api/parse-requirement/follows`, {
        query: { id: data.id, solutionId: solution.id }
    })
    dataRows.value[data.id].isLoading = false;
}

const onRowCollapse = async ({ data }: DataTableRowCollapseEvent) => {
    dataRows.value[data.id] = { isLoading: false, data: {} };
}

const reqKeys = (req: object = {}) => Object.keys(req)
    .filter(key => !['id', 'lastModified', 'modifiedBy', 'follows', 'solution', 'req_type', 'isSilence'].includes(key))

</script>

<template>
    <div>
        <p>The Workbox is the list of parsed requirements awaiting review</p>
        <InlineMessage v-if="!parsedRequirements?.length" severity="info">
            The Workbox is empty.
        </InlineMessage>
        <DataTable v-model:expandedRows="expandedRows" dataKey="id" :value="parsedRequirements" @rowExpand="onRowExpand"
            @rowCollapse="onRowCollapse" stripedRows>
            <Column expander style="width: 5rem" />
            <Column field="lastModified" header="Date" sortable>
                <template #body="{ data }">
                    <time :datetime="data.lastModified.toISOString()">{{ data.lastModified.toLocaleString() }}</time>
                </template>
            </Column>
            <Column field="modifiedBy" header="Modified By" sortable>
                <template #body="{ data }">
                    {{ data.modifiedBy.name }}
                </template>
            </Column>
            <Column field="description" header="Statement" sortable></Column>
            <template #expansion="{ data }">
                <DataTable v-for="reqType of reqKeys(dataRows[data.id]?.data)"
                    :value="dataRows[data.id].data[reqType as ReqType]" :loading="dataRows[data.id].isLoading"
                    stripedRows>
                    <template #header>
                        <h4>{{ snakeCaseToTitle(reqType) }}</h4>
                    </template>
                    <Column v-for="col of reqKeys(dataRows[data.id]?.data[reqType as ReqType]?.[0])" :key="col"
                        :field="col" :header="camelCaseToTitle(col)" sortable />
                    <Column header="Actions" frozen align-frozen="right">
                        <template #body="{ data }">
                            <Button icon="pi pi-check" text rounded class="mr-2" severity="success" title="Approve"
                                @click="onItemApprove(data)" />
                            <!--
                                TODO: implement. Field types are wanted for generating the form.
                                see: https://github.com/final-hill/cathedral/issues/164
                                -->
                            <!-- <Button icon="pi pi-pencil" text rounded class="mr-2" title="Edit"
                                @click="openEditDialog(requirements.type, data)" /> -->
                            <Button icon="pi pi-trash" text rounded severity="danger" title="Delete"
                                @click="onItemDelete(data)" />
                        </template>
                    </Column>
                </DataTable>
            </template>
        </DataTable>
    </div>
</template>