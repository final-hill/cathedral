<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import type Component from '~/domain/Component';
import SolutionInteractor from '~/modules/solution/application/SolutionInteractor';
import ComponentRepository from '~/data/ComponentRepository';
import ComponentInteractor from '~/application/ComponentInteractor';

useHead({ title: 'Components' })

const slug = useRoute().params.solutionSlug as string,
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    componentInteractor = new ComponentInteractor(new ComponentRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0],
    solutionId = solution.id;

type ComponentViewModel = Pick<Component, 'id' | 'name' | 'statement'>;

const components = ref<ComponentViewModel[]>(await componentInteractor.getAll({ solutionId })),
    emptyComponent = { id: emptyUuid, name: '', statement: '' };

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: ComponentViewModel) => {
    const newId = await componentInteractor.create({
        ...data,
        solutionId,
        parentComponentId: emptyUuid,
        property: ''
    })

    components.value = await componentInteractor.getAll({ solutionId })
}

const onDelete = async (id: Uuid) => {
    await componentInteractor.delete(id)
    components.value = await componentInteractor.getAll({ solutionId })
}

const onUpdate = async (data: ComponentViewModel) => {
    await componentInteractor.update({
        ...data,
        solutionId,
        parentComponentId: emptyUuid,
        property: ''
    })
    components.value = await componentInteractor.getAll({ solutionId })
}
</script>

<template>
    <p>
        Environment components are the EXTERNAL elements that the system interacts with.
        These external components expose interfaces that the system uses to communicate with.
    </p>
    <XDataTable :datasource="components" :empty-record="emptyComponent" :filters="filters" :on-create="onCreate"
        :on-delete="onDelete" :on-update="onUpdate">
        <Column field="name" header="Name" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by name" />
            </template>
            <template #body="{ data }">
                {{ data.name }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required="true" />
            </template>
        </Column>
        <Column field="statement" header="Description">
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                    placeholder="Search by description" />
            </template>
            <template #body="{ data }">
                {{ data.statement }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required="true" />
            </template>
        </Column>
    </XDataTable>
</template>