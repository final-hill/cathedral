<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import PersonRepository from '../../data/PersonRepository';
import type Person from '../../domain/Person';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import { FilterMatchMode } from 'primevue/api';
import StakeholderRepository from '~/modules/goals/data/StakeholderRepository';
import type Stakeholder from '~/modules/goals/domain/Stakeholder';
import SolutionInteractor from '~/modules/solution/application/SolutionInteractor';
import PersonInteractor from '../../application/PersonInteractor';
import StakeholderInteractor from '~/modules/goals/application/StakeholderInteractor';

useHead({ title: 'Roles & Personnel' })

const slug = useRoute().params.solutionSlug as string,
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    personInteractor = new PersonInteractor(new PersonRepository()),
    stakeholderInteractor = new StakeholderInteractor(new StakeholderRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0],
    solutionId = solution.id;

type StakeholderViewModel = Pick<Stakeholder, 'id' | 'name'>
type PersonnelViewModel = Pick<Person, 'id' | 'name' | 'email' | 'roleId'>;

const personnel = ref<PersonnelViewModel[]>(await personInteractor.getAll({ solutionId })),
    stakeholders = ref<StakeholderViewModel[]>(await stakeholderInteractor.getAll({ solutionId })),
    emptyPersonnel: PersonnelViewModel = { id: emptyUuid, name: '', email: '', roleId: emptyUuid };

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'email': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'roleId': { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const onCreate = async (data: PersonnelViewModel) => {
    const newId = await personInteractor.create({
        ...data,
        property: '',
        solutionId,
        statement: ''
    })

    personnel.value = await personInteractor.getAll({ solutionId })
}

const onUpdate = async (data: PersonnelViewModel) => {
    await personInteractor.update({
        ...data,
        property: '',
        solutionId,
        statement: ''
    })

    personnel.value = await personInteractor.getAll({ solutionId })
}

const onDelete = async (id: Uuid) => {
    await personInteractor.delete(id)

    personnel.value = await personInteractor.getAll({ solutionId })
}
</script>
<template>
    <p>
        Roles & Personnel lists the roles and personnel involved in the project
        along with their responsibilities, availability, and contact information.
    </p>

    <XDataTable :datasource="personnel" :empty-record="emptyPersonnel" :filters="filters" :on-create="onCreate"
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
        <Column field="email" header="Email" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by name" />
            </template>
            <template #body="{ data, field }">
                {{ data[field] }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required />
            </template>
        </Column>
        <Column field="roleId" header="Role" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name" optionValue="id"
                    :options="stakeholders" placeholder="Search by Role" />
            </template>
            <template #body="{ data, field }">
                {{ stakeholders.find(s => s.id === data[field])?.name }}
            </template>
            <template #editor="{ data, field }">
                <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="stakeholders"
                    required="true" placeholder="Select an Role" />
            </template>
        </Column>
    </XDataTable>
</template>