<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import { FilterMatchMode } from 'primevue/api';
import LimitRepository from '../../data/LimitRepository';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import SolutionInteractor from '~/modules/solution/application/SolutionInteractor';
import LimitInteractor from '../../application/LimitInteractor';
import type Limit from '../../domain/Limit';

useHead({ title: 'Limitations' })

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0],
    limitInteractor = new LimitInteractor(new LimitRepository())

if (!solution) {
    router.push({ name: 'Solutions' })
}

type LimitViewModel = Pick<Limit, 'id' | 'name' | 'statement'>;

const limits = ref<LimitViewModel[]>([]),
    emptyLimit: LimitViewModel = { id: emptyUuid, name: '', statement: '' };

onMounted(async () => {
    limits.value = await limitInteractor.getAll({ solutionId: solution!.id })
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: LimitViewModel) => {
    const newId = await limitInteractor.create({
        solutionId: solution!.id,
        name: data.name,
        statement: data.statement,
        property: ''
    })

    limits.value = await limitInteractor.getAll({ solutionId: solution!.id })
}

const onUpdate = async (data: LimitViewModel) => {
    await limitInteractor.update({
        id: data.id,
        name: data.name,
        statement: data.statement,
        property: '',
        solutionId: solution!.id
    })

    limits.value = await limitInteractor.getAll({ solutionId: solution!.id })
}

const onDelete = async (id: Uuid) => {
    await limitInteractor.delete(id)

    limits.value = await limitInteractor.getAll({ solutionId: solution!.id })
}
</script>
<template>
    <p>
        Limitations are the constraints on functionality. They describe What that is out-of-scope and excluded.
        Example: "Providing an interface to the user to change the color of the background is out-of-scope."
    </p>

    <XDataTable :datasource="limits" :empty-record="emptyLimit" :filters="filters" :on-create="onCreate"
        :on-update="onUpdate" :on-delete="onDelete">
        <Column field="name" header="Name" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by name" />
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