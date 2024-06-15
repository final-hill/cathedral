<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import ProjectRepository from '../../data/ProjectRepository';
import PersonRepository from '../../data/PersonRepository';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import GetProjectBySolutionIdUseCase from '../../application/GetProjectBySolutionIdUseCase';
import GetPersonnelUseCase from '../../application/GetPersonnelUseCase';
import type Person from '../../domain/Person';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import { FilterMatchMode } from 'primevue/api';
import CreatePersonUseCase from '../../application/CreatePersonUseCase';
import UpdatePersonUseCase from '../../application/UpdatePersonUseCase';
import DeletePersonUseCase from '../../application/DeletePersonUseCase';
import StakeholderRepository from '~/modules/goals/data/StakeholderRepository';
import GetStakeHoldersUseCase from '~/modules/goals/application/GetStakeHoldersUseCase';
import GoalsRepository from '~/modules/goals/data/GoalsRepository';
import GetGoalsBySolutionIdUseCase from '~/modules/goals/application/GetGoalsBySolutionIdUseCase';
import type Stakeholder from '~/modules/goals/domain/Stakeholder';

useHead({
    title: 'Roles & Personnel'
})

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    goalsRepository = new GoalsRepository(),
    projectRepository = new ProjectRepository(),
    personRepository = new PersonRepository(),
    stakeholderRepository = new StakeholderRepository(),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    solution = await getSolutionBySlugUseCase.execute(slug),
    getProjectBySolutionIdUseCase = new GetProjectBySolutionIdUseCase(projectRepository),
    project = solution?.id && await getProjectBySolutionIdUseCase.execute(solution.id),
    getGoalsBySolutionIdUseCase = new GetGoalsBySolutionIdUseCase(goalsRepository),
    goals = solution?.id && await getGoalsBySolutionIdUseCase.execute(solution.id),
    getStakeholdersUseCase = new GetStakeHoldersUseCase(stakeholderRepository),
    getPersonnelUseCase = new GetPersonnelUseCase(personRepository),
    createPersonUseCase = new CreatePersonUseCase(personRepository),
    updatePersonUseCase = new UpdatePersonUseCase(personRepository),
    deletePersonUseCase = new DeletePersonUseCase(personRepository);

if (!solution) {
    router.push({ name: 'Solutions' })
} else {
    if (!project)
        router.push({ name: 'Project', params: { solutionSlug: slug } });
    if (!goals)
        router.push({ name: 'Goals', params: { solutionSlug: slug } });
}

type StakeholderViewModel = Pick<Stakeholder, 'id' | 'name'>
type PersonnelViewModel = Pick<Person, 'id' | 'name' | 'email' | 'roleId'>;

const personnel = ref<PersonnelViewModel[]>([]),
    stakeholders = ref<StakeholderViewModel[]>([]),
    emptyPersonnel: PersonnelViewModel = { id: emptyUuid, name: '', email: '', roleId: emptyUuid };

onMounted(async () => {
    stakeholders.value = await getStakeholdersUseCase.execute(goals!.id) ?? []
    personnel.value = await getPersonnelUseCase.execute(project!.id) ?? []
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'email': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'roleId': { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const onCreate = async (data: PersonnelViewModel) => {
    const newId = await createPersonUseCase.execute({
        projectId: project!.id,
        solutionId: solution!.id,
        name: data.name,
        email: data.email,
        roleId: data.roleId
    })

    personnel.value = await getPersonnelUseCase.execute(project!.id) ?? []
}

const onUpdate = async (data: PersonnelViewModel) => {
    await updatePersonUseCase.execute({
        id: data.id,
        projectId: project!.id,
        solutionId: solution!.id,
        name: data.name,
        email: data.email,
        roleId: data.roleId
    })

    personnel.value = await getPersonnelUseCase.execute(project!.id) ?? []
}

const onDelete = async (id: Uuid) => {
    await deletePersonUseCase.execute(id)

    personnel.value = await getPersonnelUseCase.execute(project!.id) ?? []
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