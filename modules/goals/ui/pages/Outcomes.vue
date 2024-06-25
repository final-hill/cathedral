<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import OutcomeRepository from '../../data/OutcomeRepository';
import { FilterMatchMode } from 'primevue/api';
import type Outcome from '../../domain/Outcome';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import SolutionInteractor from '~/modules/solution/application/SolutionInteractor';
import OutcomeInteractor from '../../application/OutcomeInteractor';

useHead({ title: 'Outcomes' })

const slug = useRoute().params.solutionSlug as string,
    outcomeInteractor = new OutcomeInteractor(new OutcomeRepository()),
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0],
    solutionId = solution.id;

type OutcomeViewModel = Pick<Outcome, 'id' | 'name' | 'statement'>;

const outcomes = ref<OutcomeViewModel[]>(await outcomeInteractor.getAll({ solutionId })),
    emptyOutcome: OutcomeViewModel = { id: emptyUuid, name: '', statement: '' };

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: OutcomeViewModel) => {
    const newId = await outcomeInteractor.create({
        solutionId,
        name: data.name,
        statement: data.statement,
        property: ''
    })

    outcomes.value = await outcomeInteractor.getAll({ solutionId })
}

const onUpdate = async (data: OutcomeViewModel) => {
    await outcomeInteractor.update({
        id: data.id,
        name: data.name,
        statement: data.statement,
        property: '',
        solutionId
    })

    outcomes.value = await outcomeInteractor.getAll({ solutionId })
}

const onDelete = async (id: Uuid) => {
    await outcomeInteractor.delete(id)

    outcomes.value = await outcomeInteractor.getAll({ solutionId })
}
</script>

<template>
    <p>
        Outcomes are the expected benefits, capabilities, or processes
        of the system that will be achieved by the associated project.
    </p>

    <XDataTable :datasource="outcomes" :filters="filters" :empty-record="emptyOutcome" :onCreate="onCreate"
        :onUpdate="onUpdate" :onDelete="onDelete">
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