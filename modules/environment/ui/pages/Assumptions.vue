<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import AssumptionRepository from '../../data/AssumptionRepository';
import type Assumption from '../../domain/Assumption';
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import SolutionInteractor from '~/modules/solution/application/SolutionInteractor';
import AssumptionInteractor from '../../application/AssumptionInteractor';

useHead({ title: 'Assumptions' })

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0],
    assumptionInteractor = new AssumptionInteractor(new AssumptionRepository())

if (!solution)
    router.push({ name: 'Solutions' });

type AssumptionViewModel = Pick<Assumption, 'id' | 'name' | 'statement'>;

const assumptions = ref<AssumptionViewModel[]>([]),
    emptyAssumption = { id: emptyUuid, name: '', statement: '' };

onMounted(async () => {
    assumptions.value = await assumptionInteractor.getAll({ solutionId: solution!.id })
})

const filters = ref<Record<string, { value: any, matchMode: string }>>({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: AssumptionViewModel) => {
    const newId = await assumptionInteractor.create({
        name: data.name,
        statement: data.statement,
        property: '',
        solutionId: solution!.id
    })

    assumptions.value = await assumptionInteractor.getAll({ solutionId: solution!.id })
}

const onDelete = async (id: Uuid) => {
    await assumptionInteractor.delete(id)
    assumptions.value = await assumptionInteractor.getAll({ solutionId: solution!.id })
}

const onUpdate = async (data: AssumptionViewModel) => {
    await assumptionInteractor.update({
        id: data.id,
        name: data.name,
        statement: data.statement,
        property: '',
        solutionId: solution!.id
    })
    assumptions.value = await assumptionInteractor.getAll({ solutionId: solution!.id })
}
</script>

<template>
    <p>
        An assumption is a property of the environment that is assumed to be true.
        Assumptions are used to simplify the problem and to make it more tractable.
        An example of an assumption would be: "Screen resolution will not change during
        the execution of the program".
    </p>
    <XDataTable :datasource="assumptions" :filters="filters" :empty-record="emptyAssumption" :on-create="onCreate"
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