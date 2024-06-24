<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import SolutionInteractor from '~/modules/solution/application/SolutionInteractor';
import ComponentRepository from '~/data/ComponentRepository';
import ComponentInteractor from '~/application/ComponentInteractor';
import type Component from '~/domain/Component';

useHead({ title: 'Components' })

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    componentInteractor = new ComponentInteractor(new ComponentRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0]

if (!solution)
    router.push({ name: 'Solutions' })

type ComponentViewModel = Pick<Component, 'id' | 'name' | 'statement' | 'parentComponentId'>;

const components = ref<Component[]>([]),
    emptyComponent: ComponentViewModel = {
        id: emptyUuid,
        name: '',
        statement: '',
        parentComponentId: emptyUuid
    };

onMounted(async () => {
    components.value = await componentInteractor.getAll({ solutionId: solution!.id })
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'parentId': { value: null, matchMode: FilterMatchMode.EQUALS }
})

const onCreate = async (data: ComponentViewModel) => {
    await componentInteractor.create({
        ...data,
        solutionId: solution!.id,
        property: ''
    });

    components.value = await componentInteractor.getAll({ solutionId: solution!.id })
}

const onUpdate = async (data: ComponentViewModel) => {
    await componentInteractor.update({
        ...data,
        solutionId: solution!.id,
        property: ''
    });

    components.value = await componentInteractor.getAll({ solutionId: solution!.id })
}

const onDelete = async (id: Uuid) => {
    await componentInteractor.delete(id)

    components.value = await componentInteractor.getAll({ solutionId: solution!.id })
}
</script>
<template>
    <p>
        Components describe the structure of the system as a list or hierarchy.
    </p>
    <XDataTable :datasource="components" :filters="filters" :emptyRecord="emptyComponent" :onCreate="onCreate"
        :onUpdate="onUpdate" :onDelete="onDelete">
        <Column field="name" header="Name" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by name" />
            </template>
            <template #body="{ data, field }">
                {{ data[field] }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required="true" placeholder="Enter a name" />
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
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required="true" placeholder="Enter a description" />
            </template>
        </Column>
        <Column field="parentId" header="Parent">
            <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name" optionValue="id"
                    :options="components" placeholder="Search by Component" />
            </template>
            <template #body="{ data, field }">
                {{ components
                    .filter(c => c.id !== emptyUuid)
                    .find(c => c.id === data[field])?.name }}
            </template>
            <template #editor="{ data, field }">
                <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id"
                    :options="components.filter(c => c.id !== data.id)" placeholder="Select a Component" showClear />
            </template>
        </Column>
    </XDataTable>
</template>