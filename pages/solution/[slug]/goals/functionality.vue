<script lang="ts" setup>
import SolutionRepository from '~/data/SolutionRepository';
import SolutionInteractor from '~/application/SolutionInteractor';
import FunctionalBehaviorRepository from '~/data/FunctionalBehaviorRepository';
import FunctionalBehaviorInteractor from '~/application/FunctionalBehaviorInteractor';
import type FunctionalBehavior from '~/domain/FunctionalBehavior';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import { FilterMatchMode } from 'primevue/api';

useHead({ title: 'Functionality' })
definePageMeta({ name: 'Goals Functionality' })

const slug = useRoute().params.slug as string,
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0],
    solutionId = solution.id,
    functionalBehaviorInteractor = new FunctionalBehaviorInteractor(new FunctionalBehaviorRepository())

type FunctionalBehaviorViewModel = Pick<FunctionalBehavior, 'id' | 'name' | 'statement' | 'priorityId'>;

const functionalBehaviours = ref<FunctionalBehaviorViewModel[]>(await functionalBehaviorInteractor.getAll({ solutionId })),
    emptyFunctionalBehaviour: FunctionalBehaviorViewModel = { id: emptyUuid, name: '', statement: '', priorityId: 'MUST' };

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: FunctionalBehaviorViewModel) => {
    const newId = await functionalBehaviorInteractor.create({
        solutionId,
        name: data.name,
        statement: data.statement,
        property: '',
        componentId: emptyUuid,
        priorityId: 'MUST'
    })

    functionalBehaviours.value = await functionalBehaviorInteractor.getAll({ solutionId })
}

const onUpdate = async (data: FunctionalBehaviorViewModel) => {
    await functionalBehaviorInteractor.update({
        id: data.id,
        name: data.name,
        statement: data.statement,
        property: '',
        solutionId,
        componentId: emptyUuid,
        priorityId: data.priorityId
    })

    functionalBehaviours.value = await functionalBehaviorInteractor.getAll({ solutionId })
}

const onDelete = async (id: Uuid) => {
    await functionalBehaviorInteractor.delete(id)

    functionalBehaviours.value = await functionalBehaviorInteractor.getAll({ solutionId })
}
</script>

<template>
    <p>
        This section describes the Functional Requirements of the solution.
        These are the features that the solution must have to meet the needs of the users.
        They describe <strong>what</strong> the solution must do and not how it does it.
    </p>

    <XDataTable :datasource="functionalBehaviours" :empty-record="emptyFunctionalBehaviour" :filters="filters"
        :on-create="onCreate" :on-update="onUpdate" :on-delete="onDelete">
        <Column field="name" header="Function" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                    placeholder="Search by function" />
            </template>
            <template #body="{ data }">
                {{ data.name }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required />
            </template>
        </Column>
        <Column field="statement" header="Description">
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                    placeholder="Search by Description" />
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