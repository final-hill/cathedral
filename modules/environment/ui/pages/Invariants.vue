<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import InvariantRepository from '../../data/InvariantRepository';
import type Invariant from '../../domain/Invariant';
import SolutionInteractor from '~/modules/solution/application/SolutionInteractor';
import InvariantInteractor from '../../application/InvariantInteractor';

useHead({ title: 'Invariants' })

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0],
    invariantInteractor = new InvariantInteractor(new InvariantRepository())

if (!solution)
    router.push({ name: 'Solutions' });

type InvariantViewModel = Pick<Invariant, 'id' | 'name' | 'statement'>;

const invariants = ref<InvariantViewModel[]>([]),
    emptyInvariant: InvariantViewModel = { id: emptyUuid, name: '', statement: '' };

onMounted(async () => {
    invariants.value = await invariantInteractor.getAll({ solutionId: solution!.id })
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: InvariantViewModel) => {
    const newId = await invariantInteractor.create({
        name: data.name,
        statement: data.statement,
        solutionId: solution!.id,
        property: ''
    })

    invariants.value = await invariantInteractor.getAll({ solutionId: solution!.id })
}

const onUpdate = async (data: InvariantViewModel) => {
    await invariantInteractor.update({
        id: data.id,
        name: data.name,
        statement: data.statement,
        solutionId: solution!.id,
        property: ''
    })

    invariants.value = await invariantInteractor.getAll({ solutionId: solution!.id })
}

const onDelete = async (id: Uuid) => {
    await invariantInteractor.delete(id)

    invariants.value = await invariantInteractor.getAll({ solutionId: solution!.id })
}
</script>

<template>
    <p>
        Invariants are properties that must always be true. They are used to
        constrain the possible states of a system.
    </p>

    <XDataTable :datasource="invariants" :empty-record="emptyInvariant" :filters="filters" :on-create="onCreate"
        :on-update="onUpdate" :on-delete="onDelete">
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