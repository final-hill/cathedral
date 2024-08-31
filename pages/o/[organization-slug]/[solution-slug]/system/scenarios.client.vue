<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import { MoscowPriority } from '~/server/domain/requirements/index';
import { NIL as emptyUuid } from 'uuid';

useHead({ title: 'Scenarios' })
definePageMeta({ name: 'Scenarios' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Scenarios').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id!;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

type UserStoryViewModel = {
    id: string;
    name: string;
    primaryActorId: string;
    functionalBehaviorId: string;
    outcomeId: string;
    priority: MoscowPriority;

}

type UseCaseViewModel = {
    id: string;
    name: string;
    primaryActorId: string;
    extensions: string;
    goalInContext: string;
    level: string;
    mainSuccessScenario: string;
    preconditionId: string;
    scope: string;
    successGuaranteeId: string;
    triggerid: string;
    priority: MoscowPriority;
}

const { data: userStories, refresh: refreshUserStories, error: getUserStoriesError } = await useFetch(`/api/user-stories?solutionId=${solutionId}`),
    { data: useCases, refresh: refreshUseCases, error: getUseCasesError } = await useFetch(`/api/use-cases?solutionId=${solutionId}`),
    emptyUserStory: UserStoryViewModel = {
        id: emptyUuid,
        name: '',
        primaryActorId: emptyUuid,
        functionalBehaviorId: emptyUuid,
        outcomeId: emptyUuid,
        priority: MoscowPriority.MUST
    },
    emptyUseCase: UseCaseViewModel = {
        id: emptyUuid,
        name: '',
        primaryActorId: emptyUuid,
        extensions: '',
        goalInContext: '',
        level: '',
        mainSuccessScenario: '',
        preconditionId: emptyUuid,
        scope: '',
        successGuaranteeId: emptyUuid,
        triggerid: emptyUuid,
        priority: MoscowPriority.MUST
    },
    { data: roles, error: getRolesError } = await useFetch(`/api/stakeholders?solutionId=${solutionId}`),
    { data: functionalBehaviors, error: getFunctionalBehaviorsError } = await useFetch(`/api/functional-behaviors?solutionId=${solutionId}`),
    { data: outcomes, error: getOutcomesError } = await useFetch(`/api/outcomes?solutionId=${solutionId}`),
    { data: assumptions, error: getAssumptionsError } = await useFetch(`/api/assumptions?solutionId=${solutionId}`),
    { data: effects, error: getEffectsError } = await useFetch(`/api/effects?solutionId=${solutionId}`),
    triggers = ref([])

if (getUserStoriesError.value)
    $eventBus.$emit('page-error', getUserStoriesError.value);
if (getRolesError.value)
    $eventBus.$emit('page-error', getRolesError.value);
if (getFunctionalBehaviorsError.value)
    $eventBus.$emit('page-error', getFunctionalBehaviorsError.value);
if (getOutcomesError.value)
    $eventBus.$emit('page-error', getOutcomesError.value);
if (getAssumptionsError.value)
    $eventBus.$emit('page-error', getAssumptionsError.value);
if (getEffectsError.value)
    $eventBus.$emit('page-error', getEffectsError.value);

const userStoryfilters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'primaryActorId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'functionalBehaviorId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'outcomeId': { value: null, matchMode: FilterMatchMode.EQUALS }
})

const useCasefilters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'primaryActorId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'extensions': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'goalInContext': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'level': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'mainSuccessScenario': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'preconditionId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'scope': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'successGuaranteeId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'triggerId': { value: null, matchMode: FilterMatchMode.EQUALS }
})

const onUserStoryCreate = async (userStory: UserStoryViewModel) => {
    await $fetch(`/api/user-stories`, {
        method: 'POST',
        body: {
            ...userStory,
            solutionId,
            statement: '',
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUserStories();
}

const onUseCaseCreate = async (useCase: UseCaseViewModel) => {
    await $fetch(`/api/use-cases`, {
        method: 'POST',
        body: {
            ...useCase,
            solutionId,
            statement: '',
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUseCases();
}

const onUserStoryUpdate = async (userStory: UserStoryViewModel) => {
    await $fetch(`/api/user-stories/${userStory.id}`, {
        method: 'PUT',
        body: {
            ...userStory,
            solutionId,
            statement: '',
            priority: userStory.priority
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUserStories();
}

const onUseCaseUpdate = async (useCase: UseCaseViewModel) => {
    await $fetch(`/api/use-cases/${useCase.id}`, {
        method: 'PUT',
        body: {
            ...useCase,
            solutionId,
            statement: ''
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUseCases();
}

const onUserStoryDelete = async (id: string) => {
    await $fetch(`/api/user-stories/${id}`, { method: 'DELETE' })
        .catch((e) => $eventBus.$emit('page-error', e));

    refreshUserStories();
}

const onUseCaseDelete = async (id: string) => {
    await $fetch(`/api/use-cases/${id}`, { method: 'DELETE' })
        .catch((e) => $eventBus.$emit('page-error', e));

    refreshUseCases();
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
                            optionValue="id" :options="roles!" placeholder="Search by Actor" />
                    </template>
                    <template #body="{ data, field }">
                        {{ roles?.find(r => r.id === data[field])?.name }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="roles!"
                            placeholder="Select an Actor" />
                    </template>
                </Column>
                <Column field="functionalBehaviorId" header="Behavior">
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name"
                            optionValue="id" :options="functionalBehaviors!" placeholder="Search by Behavior" />
                    </template>
                    <template #body="{ data, field }">
                        {{ functionalBehaviors?.find(b => b.id === data[field])?.name }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id"
                            :options="functionalBehaviors!" placeholder="Select a Behavior" />
                    </template>
                </Column>
                <Column field="outcomeId" header="Outcome">
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name"
                            optionValue="id" :options="outcomes!" placeholder="Search by Outcome" />
                    </template>
                    <template #body="{ data, field }">
                        {{ outcomes?.find(o => o.id === data[field])?.name }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="outcomes!"
                            placeholder="Select an Outcome" />
                    </template>
                </Column>
            </XDataTable>
        </TabPanel>
        <TabPanel header="Use Cases">
            <p>
                A Use Case describes a complete interaction between an actor and the
                system to achieve a goal.
            </p>
            <XDataTable :datasource="useCases!" :filters="useCasefilters" :emptyRecord="emptyUseCase"
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
                <Column field="primaryActorId" header="Actor">
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name"
                            optionValue="id" :options="roles!" placeholder="Search by Actor" />
                    </template>
                    <template #body="{ data, field }">
                        {{ roles?.find(r => r.id === data[field])?.name }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="roles!"
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
                <Column field="preconditionId" header="Precondition">
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name"
                            optionValue="id" :options="assumptions!" placeholder="Search by precondition" />
                    </template>
                    <template #body="{ data, field }">
                        {{ assumptions?.find(a => a.id === data[field])?.name }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="assumptions!"
                            placeholder="Select a pre-condition" />
                    </template>
                </Column>
                <Column field="triggerId" header="Trigger">
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name"
                            optionValue="id" :options="triggers!" placeholder="Search by trigger" />
                    </template>
                    <template #body="{ data, field }">
                        {{ effects?.find(e => e.id === data[field])?.name }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="triggers!"
                            placeholder="Select a trigger" />
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
                <Column field="successGuaranteeId" header="Success Guarantee">
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name"
                            optionValue="id" :options="effects!" placeholder="Search by success guarantee" />
                    </template>
                    <template #body="{ data, field }">
                        {{ effects?.find(e => e.id === data[field])?.name }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="effects!"
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
                            data[field].map((id: string) => roles.find((r: any) => r.id === id)?.name).join(', ')
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