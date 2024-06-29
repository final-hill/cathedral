<script lang="ts" setup>
import SolutionRepository from '~/data/SolutionRepository';
import UserStoryRepository from '~/data/UserStoryRepository';
import UserStoryInteractor from '~/application/UserStoryInteractor';
import type UserStory from '~/domain/UserStory';
import type UseCase from '~/domain/UseCase';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import { FilterMatchMode } from 'primevue/api';
import FunctionalBehavior from '~/domain/FunctionalBehavior';
import FunctionalRequirementInteractor from '~/application/FunctionalBehaviorInteractor';
import FunctionalRequirementRepository from '~/data/FunctionalBehaviorRepository';
import StakeholderRepository from '~/data/StakeholderRepository';
import Stakeholder from '~/domain/Stakeholder';
import UseCaseInteractor from '~/application/UseCaseInteractor';
import UseCaseRepository from '~/data/UseCaseRepository';
import SolutionInteractor from '~/application/SolutionInteractor';
import StakeholderInteractor from '~/application/StakeholderInteractor';
import type Outcome from '~/domain/Outcome';
import OutcomeInteractor from '~/application/OutcomeInteractor';
import OutcomeRepository from '~/data/OutcomeRepository';
import AssumptionInteractor from '~/application/AssumptionInteractor';
import AssumptionRepository from '~/data/AssumptionRepository';
import EffectInteractor from '~/application/EffectInteractor';
import EffectRepository from '~/data/EffectRepository';
import type Assumption from '~/domain/Assumption';
import Effect from '~/domain/Effect';

useHead({ title: 'Scenarios' })
definePageMeta({ name: 'Scenarios' })

const slug = useRoute().params.slug as string,
    userStoryInteractor = new UserStoryInteractor(new UserStoryRepository()),
    stakeholderInteractor = new StakeholderInteractor(new StakeholderRepository()),
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0],
    solutionId = solution.id,
    functionalRequirementInteractor = new FunctionalRequirementInteractor(new FunctionalRequirementRepository()),
    useCaseInteractor = new UseCaseInteractor(new UseCaseRepository()),
    outcomeInteractor = new OutcomeInteractor(new OutcomeRepository()),
    assumptionInteractor = new AssumptionInteractor(new AssumptionRepository()),
    effectInteractor = new EffectInteractor(new EffectRepository());

type UserStoryViewModel = Pick<UserStory, 'id' | 'name' | 'primaryActorId' | 'functionalBehaviorId' | 'outcomeId' | 'priorityId'>

type UseCaseViewModel = Pick<UseCase, 'id' | 'name' | 'primaryActorId' | 'extensions' | 'goalInContext' | 'level' | 'mainSuccessScenario' | 'preConditionId' | 'scope' | 'successGuarantee' | 'trigger' | 'priorityId'>

const userStories = ref<UserStoryViewModel[]>(await userStoryInteractor.getAll({ solutionId })),
    useCases = ref<UseCaseViewModel[]>(await useCaseInteractor.getAll({ solutionId })),
    emptyUserStory: UserStoryViewModel = {
        id: emptyUuid,
        name: '',
        primaryActorId: emptyUuid,
        functionalBehaviorId: emptyUuid,
        outcomeId: emptyUuid,
        priorityId: 'MUST'
    },
    emptyUseCase: UseCaseViewModel = {
        id: emptyUuid,
        name: '',
        primaryActorId: emptyUuid,
        extensions: '',
        goalInContext: '',
        level: '',
        mainSuccessScenario: '',
        preConditionId: emptyUuid,
        scope: '',
        successGuarantee: emptyUuid,
        trigger: emptyUuid,
        priorityId: 'MUST'
    },
    roles = ref<Stakeholder[]>(await stakeholderInteractor.getAll({ solutionId })),
    functionalBehaviors = ref<FunctionalBehavior[]>(await functionalRequirementInteractor.getAll({ solutionId })),
    outcomes = ref<Outcome[]>(await outcomeInteractor.getAll({ solutionId })),
    assumptions = ref<Assumption[]>(await assumptionInteractor.getAll({ solutionId })),
    effects = ref<Effect[]>(await effectInteractor.getAll({ solutionId }));

const userStoryfilters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'primaryActorId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'behaviorId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'outcomeId': { value: null, matchMode: FilterMatchMode.EQUALS }
})

const useCasefilters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'primaryActorId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'extensions': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'goalInContext': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'level': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'mainSuccessScenario': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'preConditionId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'scope': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'successGuarantee': { value: null, matchMode: FilterMatchMode.EQUALS },
    'trigger': { value: null, matchMode: FilterMatchMode.EQUALS }
})

const onUserStoryCreate = async (userStory: UserStoryViewModel) => {
    const newId = await userStoryInteractor.create({
        ...userStory,
        solutionId,
        property: '',
        statement: '',
        priorityId: 'MUST'
    });

    userStories.value = await userStoryInteractor.getAll({ solutionId });
}

const onUseCaseCreate = async (useCase: UseCaseViewModel) => {
    const newId = await useCaseInteractor.create({
        ...useCase,
        solutionId,
        property: '',
        statement: '',
        priorityId: 'MUST'
    });

    useCases.value = await useCaseInteractor.getAll({ solutionId });
}

const onUserStoryUpdate = async (userStory: UserStoryViewModel) => {
    await userStoryInteractor.update({
        ...userStory,
        property: '',
        statement: '',
        solutionId,
        priorityId: userStory.priorityId
    });

    userStories.value = await userStoryInteractor.getAll({ solutionId });
}

const onUseCaseUpdate = async (useCase: UseCaseViewModel) => {
    await useCaseInteractor.update({
        ...useCase,
        solutionId,
        property: '',
        statement: ''
    });

    useCases.value = await useCaseInteractor.getAll({ solutionId });
}

const onUserStoryDelete = async (id: Uuid) => {
    await userStoryInteractor.delete(id);

    userStories.value = await userStoryInteractor.getAll({ solutionId });
}

const onUseCaseDelete = async (id: Uuid) => {
    await useCaseInteractor.delete(id);

    useCases.value = await useCaseInteractor.getAll({ solutionId });
}
</script>

<template>
    <h1>Scenarios</h1>

    <p>Scenarios are the detailed steps that an actor takes to achieve a goal.</p>

    <TabView>
        <TabPanel header="User Stories">
            <p>
                A User Story specifies a goal that an actor wants to achieve by
                leveraging a particular behavior of the system.
            </p>

            <XDataTable :datasource="userStories" :filters="userStoryfilters" :emptyRecord="emptyUserStory"
                :onCreate="onUserStoryCreate" :onUpdate="onUserStoryUpdate" :onDelete="onUserStoryDelete">
                <Column field="name" header="Name" sortable>
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                            placeholder="Search by name" />
                    </template>
                    <template #body="{ data, field }">
                        {{ data[field] }}
                    </template>
                    <template #editor="{ data, field }">
                        <InputText v-model.trim="data[field]" required="true" placeholder="Enter a name" />
                    </template>
                </Column>
                <Column field="primaryActorId" header="Actor">
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name"
                            optionValue="id" :options="roles" placeholder="Search by Actor" />
                    </template>
                    <template #body="{ data, field }">
                        {{ roles.find(r => r.id === data[field])?.name }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="roles"
                            placeholder="Select an Actor" />
                    </template>
                </Column>
                <Column field="behaviorId" header="Behavior">
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name"
                            optionValue="id" :options="functionalBehaviors" placeholder="Search by Behavior" />
                    </template>
                    <template #body="{ data, field }">
                        {{ functionalBehaviors.find(b => b.id === data[field])?.name }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id"
                            :options="functionalBehaviors" placeholder="Select a Behavior" />
                    </template>
                </Column>
                <Column field="outcomeId" header="Goal">
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name"
                            optionValue="id" :options="outcomes" placeholder="Search by Goal" />
                    </template>
                    <template #body="{ data, field }">
                        {{ outcomes.find(o => o.id === data[field])?.name }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="outcomes"
                            placeholder="Select a Goal" />
                    </template>
                </Column>
            </XDataTable>
        </TabPanel>
        <TabPanel header="Use Cases">
            <p>
                A Use Case describes a complete interaction between an actor and the
                system to achieve a goal.
            </p>
            <XDataTable :datasource="useCases" :filters="useCasefilters" :emptyRecord="emptyUseCase"
                :onCreate="onUseCaseCreate" :onUpdate="onUseCaseUpdate" :onDelete="onUseCaseDelete">
                <Column field="name" header="Name" sortable>
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                            placeholder="Search by name" />
                    </template>
                    <template #body="{ data, field }">
                        {{ data[field] }}
                    </template>
                    <template #editor="{ data, field }">
                        <InputText v-model.trim="data[field]" required="true" placeholder="Enter a name" />
                    </template>
                </Column>
                <Column field="scope" header="Scope">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                            placeholder="Search by scope" />
                    </template>
                    <template #body="{ data, field }">
                        {{ data[field] }}
                    </template>
                    <template #editor="{ data, field }">
                        <InputText v-model.trim="data[field]" required="true" placeholder="Enter a scope" />
                    </template>
                </Column>
                <Column field="level" header="Level">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                            placeholder="Search by level" />
                    </template>
                    <template #body="{ data, field }">
                        {{ data[field] }}
                    </template>
                    <template #editor="{ data, field }">
                        <InputText v-model.trim="data[field]" required="true" placeholder="Enter a level" />
                    </template>
                </Column>
                <Column field="primaryActorId" header="Primary Actor">
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name"
                            optionValue="id" :options="roles" placeholder="Search by Actor" />
                    </template>
                    <template #body="{ data, field }">
                        {{ roles.find(r => r.id === data[field])?.name }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="roles"
                            placeholder="Select an Actor" />
                    </template>
                </Column>
                <Column field="goalInContext" header="Goal in Context">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                            placeholder="Search by goal in context" />
                    </template>
                    <template #body="{ data, field }">
                        {{ data[field] }}
                    </template>
                    <template #editor="{ data, field }">
                        <InputText v-model.trim="data[field]" required="true" placeholder="Enter a goal in context" />
                    </template>
                </Column>
                <Column field="preConditionId" header="Pre-Condition">
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name"
                            optionValue="id" :options="assumptions" placeholder="Search by pre-condition" />
                    </template>
                    <template #body="{ data, field }">
                        {{ assumptions.find(a => a.id === data[field])?.name }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="assumptions"
                            placeholder="Select a pre-condition" />
                    </template>
                </Column>
                <Column field="mainSuccessScenario" header="Main Success Scenario">
                    <template #body="{ data, field }">
                        {{ data[field] }}
                    </template>
                    <template #editor="{ data, field }">
                        <Textarea v-model.trim="data[field]" required="true" placeholder="Enter a main success scenario"
                            rows="5" cols="30" />
                    </template>
                </Column>
                <Column field="successGuarantee" header="Success Guarantee">
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name"
                            optionValue="id" :options="effects" placeholder="Search by success guarantee" />
                    </template>
                    <template #body="{ data, field }">
                        {{ effects.find(e => e.id === data[field])?.name }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="effects"
                            placeholder="Select a success guarantee" />
                    </template>
                </Column>
                <Column field="extensions" header="Extensions">
                    <template #body="{ data, field }">
                        {{ data[field] }}
                    </template>
                    <template #editor="{ data, field }">
                        <Textarea v-model.trim="data[field]" required="true" placeholder="Enter extensions" rows="5"
                            cols="30" />
                    </template>
                </Column>
                <!-- <Column field="stakeHoldersAndInterests" header="Stakeholders and Interests">
                    <template #body="{ data, field }">
                        {{
                            data[field].map((id: Uuid) => roles.find((r: any) => r.id === id)?.name).join(', ')
                        }}
                    </template>
                    <template #editor="{ data, field }">
                        <Listbox v-model.trim="data[field]" :options="roles" optionLabel="name" filter multiple
                            checkmark />
                    </template>
                </Column> -->
            </XDataTable>
        </TabPanel>
    </TabView>
</template>