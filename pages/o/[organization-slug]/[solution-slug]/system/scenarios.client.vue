<script lang="ts" setup>
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
    triggerId: string;
    priority: MoscowPriority;
}

const { data: userStories, refresh: refreshUserStories, error: getUserStoriesError, status: userStoryStatus } = await useFetch(`/api/user-stories`, {
    query: { solutionId }
}),
    { data: useCases, refresh: refreshUseCases, error: getUseCasesError, status: useCaseStatus } = await useFetch(`/api/use-cases`, {
        query: { solutionId }
    }),
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
        triggerId: emptyUuid,
        priority: MoscowPriority.MUST
    },
    { data: roles, error: getRolesError } = await useFetch(`/api/stakeholders`, { query: { solutionId } }),
    { data: functionalBehaviors, error: getFunctionalBehaviorsError } = await useFetch(`/api/functional-behaviors`, { query: { solutionId } }),
    { data: outcomes, error: getOutcomesError } = await useFetch(`/api/outcomes`, { query: { solutionId } }),
    { data: assumptions, error: getAssumptionsError } = await useFetch(`/api/assumptions`, { query: { solutionId } }),
    { data: effects, error: getEffectsError } = await useFetch(`/api/effects`, { query: { solutionId } }),
    triggers = ref<{ id: string, name: string }[]>([])

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
    await $fetch(`/api/user-stories/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUserStories();
}

const onUseCaseDelete = async (id: string) => {
    await $fetch(`/api/use-cases/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e));

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

            <XDataTable :datasource="userStories" :emptyRecord="emptyUserStory" :onCreate="onUserStoryCreate"
                :onUpdate="onUserStoryUpdate" :onDelete="onUserStoryDelete" :loading="userStoryStatus === 'pending'">
                <template #rows>
                    <Column field="name" header="Name" sortable>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                                placeholder="Search by name" />
                        </template>
                        <template #body="{ data, field }">
                            {{ data[field] }}
                        </template>
                    </Column>
                    <Column field="primaryActorId" header="Actor">
                        <template #filter="{ filterModel, filterCallback }">
                            <select class="p-inputtext p-component" v-model.trim="filterModel.value"
                                @input="filterCallback()">
                                <option value="" disabled>Select an Actor</option>
                                <option v-for="role in roles" :key="role.id" :value="role.id">
                                    {{ role.name }}
                                </option>
                            </select>
                        </template>
                        <template #body="{ data, field }">
                            {{ roles?.find(r => r.id === data[field])?.name }}
                        </template>
                    </Column>
                    <Column field="functionalBehaviorId" header="Behavior">
                        <template #filter="{ filterModel, filterCallback }">
                            <select class="p-inputtext p-component" v-model.trim="filterModel.value"
                                @input="filterCallback()">
                                <option value="" disabled>Select a Behavior</option>
                                <option v-for="behavior in functionalBehaviors" :key="behavior.id" :value="behavior.id">
                                    {{ behavior.name }}
                                </option>
                            </select>
                        </template>
                        <template #body="{ data, field }">
                            {{ functionalBehaviors?.find(b => b.id === data[field])?.name }}
                        </template>
                    </Column>
                    <Column field="outcomeId" header="Outcome">
                        <template #filter="{ filterModel, filterCallback }">
                            <select class="p-inputtext p-component" v-model.trim="filterModel.value"
                                @input="filterCallback()">
                                <option value="" disabled>Select an Outcome</option>
                                <option v-for="outcome in outcomes" :key="outcome.id" :value="outcome.id">
                                    {{ outcome.name }}
                                </option>
                            </select>
                        </template>
                        <template #body="{ data, field }">
                            {{ outcomes?.find(o => o.id === data[field])?.name }}
                        </template>
                    </Column>
                </template>
                <template #createDialog="{ data } : { data: UserStoryViewModel }">
                    <div class="field grid">
                        <label for="name" class="required col-fixed w-7rem">Name</label>
                        <InputText v-model.trim="data.name" name="name" required placeholder="Enter a name"
                            class="col" />
                    </div>
                    <div class="field grid">
                        <label for="primaryActorId" class="required col-fixed w-7rem">Actor</label>
                        <select class="p-inputtext p-component col" v-model.trim="data.primaryActorId"
                            name="primaryActorId">
                            <option value="" disabled>Select an Actor</option>
                            <option v-for="role in roles" :key="role.id" :value="role.id">
                                {{ role.name }}
                            </option>
                        </select>
                    </div>
                    <div class="field grid">
                        <label for="functionalBehaviorId" class="required col-fixed w-7rem">Behavior</label>
                        <select class="p-inputtext p-component col" v-model.trim="data.functionalBehaviorId"
                            name="functionalBehaviorId">
                            <option value="" disabled>Select a Behavior</option>
                            <option v-for="behavior in functionalBehaviors" :key="behavior.id" :value="behavior.id">
                                {{ behavior.name }}
                            </option>
                        </select>
                    </div>
                    <div class="field grid">
                        <label for="outcomeId" class="required col-fixed w-7rem">Outcome</label>
                        <select class="p-inputtext p-component col" v-model.trim="data.outcomeId" name="outcomeId">
                            <option value="" disabled>Select an Outcome</option>
                            <option v-for="outcome in outcomes" :key="outcome.id" :value="outcome.id">
                                {{ outcome.name }}
                            </option>
                        </select>
                    </div>
                </template>
                <template #editDialog="{ data } : { data: UserStoryViewModel }">
                    <input type="hidden" name="id" v-model.trim="data.id" />
                    <div class="field grid">
                        <label for="name" class="required col-fixed w-7rem">Name</label>
                        <InputText v-model.trim="data.name" name="name" required placeholder="Enter a name"
                            class="col" />
                    </div>
                    <div class="field grid">
                        <label for="primaryActorId" class="required col-fixed w-7rem">Actor</label>
                        <select class="p-inputtext p-component col" v-model.trim="data.primaryActorId"
                            name="primaryActorId">
                            <option value="" disabled>Select an Actor</option>
                            <option v-for="role in roles" :key="role.id" :value="role.id">
                                {{ role.name }}
                            </option>
                        </select>
                    </div>
                    <div class="field grid">
                        <label for="functionalBehaviorId" class="required col-fixed w-7rem">Behavior</label>
                        <select class="p-inputtext p-component col" v-model.trim="data.functionalBehaviorId"
                            name="functionalBehaviorId">
                            <option value="" disabled>Select a Behavior</option>
                            <option v-for="behavior in functionalBehaviors" :key="behavior.id" :value="behavior.id">
                                {{ behavior.name }}
                            </option>
                        </select>
                    </div>
                    <div class="field grid">
                        <label for="outcomeId" class="required col-fixed w-7rem">Outcome</label>
                        <select class="p-inputtext p-component col" v-model.trim="data.outcomeId" name="outcomeId">
                            <option value="" disabled>Select an Outcome</option>
                            <option v-for="outcome in outcomes" :key="outcome.id" :value="outcome.id">
                                {{ outcome.name }}
                            </option>
                        </select>
                    </div>
                </template>
            </XDataTable>
        </TabPanel>
        <TabPanel header="Use Cases">
            <p>
                A Use Case describes a complete interaction between an actor and the
                system to achieve a goal.
            </p>
            <XDataTable :datasource="useCases!" :emptyRecord="emptyUseCase" :onCreate="onUseCaseCreate"
                :onUpdate="onUseCaseUpdate" :onDelete="onUseCaseDelete" :loading="useCaseStatus === 'pending'">
                <template #rows>
                    <Column field="name" header="Name" sortable>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                                placeholder="Search by name" />
                        </template>
                        <template #body="{ data, field }">
                            {{ data[field] }}
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
                    </Column>
                    <Column field="level" header="Level">
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                                placeholder="Search by level" />
                        </template>
                        <template #body="{ data, field }">
                            {{ data[field] }}
                        </template>
                    </Column>
                    <Column field="primaryActorId" header="Actor">
                        <template #filter="{ filterModel, filterCallback }">
                            <select class="p-inputtext p-component" v-model.trim="filterModel.value"
                                @input="filterCallback()">
                                <option value="" disabled>Select an Actor</option>
                                <option v-for="role in roles" :key="role.id" :value="role.id">
                                    {{ role.name }}
                                </option>
                            </select>
                        </template>
                        <template #body="{ data, field }">
                            {{ roles?.find(r => r.id === data[field])?.name }}
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
                    </Column>
                    <Column field="preconditionId" header="Precondition">
                        <template #filter="{ filterModel, filterCallback }">
                            <select class="p-inputtext p-component" v-model.trim="filterModel.value"
                                @input="filterCallback()">
                                <option value="" disabled>Select a precondition</option>
                                <option v-for="assumption in assumptions" :key="assumption.id" :value="assumption.id">
                                    {{ assumption.name }}
                                </option>
                            </select>
                        </template>
                        <template #body="{ data, field }">
                            {{ assumptions?.find(a => a.id === data[field])?.name }}
                        </template>
                    </Column>
                    <Column field="triggerId" header="Trigger">
                        <template #filter="{ filterModel, filterCallback }">
                            <select class="p-inputtext p-component" v-model.trim="filterModel.value"
                                @input="filterCallback()">
                                <option value="" disabled>Select a trigger</option>
                                <option v-for="trigger in triggers" :key="trigger.id" :value="trigger.id">
                                    {{ trigger.name }}
                                </option>
                            </select>
                        </template>
                        <template #body="{ data, field }">
                            {{ effects?.find(e => e.id === data[field])?.name }}
                        </template>
                    </Column>
                    <Column field="mainSuccessScenario" header="Main Success Scenario">
                        <template #body="{ data, field }">
                            {{ data[field] }}
                        </template>
                    </Column>
                    <Column field="successGuaranteeId" header="Success Guarantee">
                        <template #filter="{ filterModel, filterCallback }">
                            <select class="p-inputtext p-component" v-model.trim="filterModel.value"
                                @input="filterCallback()">
                                <option value="" disabled>Select a success guarantee</option>
                                <option v-for="effect in effects" :key="effect.id" :value="effect.id">
                                    {{ effect.name }}
                                </option>
                            </select>
                        </template>
                        <template #body="{ data, field }">
                            {{ effects?.find(e => e.id === data[field])?.name }}
                        </template>
                    </Column>
                    <Column field="extensions" header="Extensions">
                        <template #body="{ data, field }">
                            {{ data[field] }}
                        </template>
                    </Column>
                </template>
                <template #createDialog="{ data } : { data: UseCaseViewModel }">
                    <div class="field grid">
                        <label for="name" class="required col-fixed w-7rem">Name</label>
                        <InputText v-model.trim="data.name" name="name" required placeholder="Enter a name"
                            class="col" />
                    </div>
                    <div class="field grid">
                        <label for="scope" class="required col-fixed w-7rem">Scope</label>
                        <InputText v-model.trim="data.scope" name="scope" required placeholder="Enter a scope"
                            class="col" />
                    </div>
                    <div class="field grid">
                        <label for="level" class="required col-fixed w-7rem">Level</label>
                        <InputText v-model.trim="data.level" name="level" required placeholder="Enter a level"
                            class="col" />
                    </div>
                    <div class="field grid">
                        <label for="primaryActorId" class="required col-fixed w-7rem">Actor</label>
                        <select class="p-inputtext p-component col" v-model.trim="data.primaryActorId"
                            name="primaryActorId">
                            <option value="" disabled>Select an Actor</option>
                            <option v-for="role in roles" :key="role.id" :value="role.id">
                                {{ role.name }}
                            </option>
                        </select>
                    </div>
                    <div class="field grid">
                        <label for="goalInContext" class="required col-fixed w-7rem">Goal in Context</label>
                        <InputText v-model.trim="data.goalInContext" name="goalInContext" required
                            placeholder="Enter a goal in context" class="col" />
                    </div>
                    <div class="field grid">
                        <label for="preconditionId" class="required col-fixed w-7rem">Pre-condition</label>
                        <select class="p-inputtext p-component col" v-model.trim="data.preconditionId"
                            name="preconditionId">
                            <option value="" disabled>Select a pre-condition</option>
                            <option v-for="assumption in assumptions" :key="assumption.id" :value="assumption.id">
                                {{ assumption.name }}
                            </option>
                        </select>
                    </div>
                    <div class="field grid">
                        <label for="triggerId" class="required col-fixed w-7rem">Trigger</label>
                        <select class="p-inputtext p-component col" v-model.trim="data.triggerId" name="triggerId">
                            <option value="" disabled>Select a trigger</option>
                            <option v-for="trigger in triggers" :key="trigger.id" :value="trigger.id">
                                {{ trigger.name }}
                            </option>
                        </select>
                    </div>
                    <div class="field grid">
                        <label for="mainSuccessScenario" class="required col-fixed w-7rem">Main Success
                            Scenario</label>
                        <Textarea v-model.trim="data.mainSuccessScenario" name="mainSuccessScenario" required
                            placeholder="Enter a main success scenario" rows="5" cols="30" class="col" />
                    </div>
                    <div class="field grid">
                        <label for="successGuaranteeId" class="required col-fixed w-7rem">Success Guarantee</label>
                        <select class="p-inputtext p-component col" v-model.trim="data.successGuaranteeId"
                            name="successGuaranteeId">
                            <option value="" disabled>Select a success guarantee</option>
                            <option v-for="effect in effects" :key="effect.id" :value="effect.id">
                                {{ effect.name }}
                            </option>
                        </select>
                    </div>
                    <div class="field grid">
                        <label for="extensions" class="required col-fixed w-7rem">Extensions</label>
                        <Textarea v-model.trim="data.extensions" name="extensions" required
                            placeholder="Enter extensions" rows="5" cols="30" class="col" />
                    </div>
                </template>
                <template #editDialog="{ data } : { data: UseCaseViewModel }">
                    <input type="hidden" name="id" v-model.trim="data.id" />
                    <div class="field grid">
                        <label for="name" class="required col-fixed w-7rem">Name</label>
                        <InputText v-model.trim="data.name" name="name" required placeholder="Enter a name"
                            class="col" />
                    </div>
                    <div class="field grid">
                        <label for="scope" class="required col-fixed w-7rem">Scope</label>
                        <InputText v-model.trim="data.scope" name="scope" required placeholder="Enter a scope"
                            class="col" />
                    </div>
                    <div class="field grid">
                        <label for="level" class="required col-fixed w-7rem">Level</label>
                        <InputText v-model.trim="data.level" name="level" required placeholder="Enter a level"
                            class="col" />
                    </div>
                    <div class="field grid">
                        <label for="primaryActorId" class="required col-fixed w-7rem">Actor</label>
                        <select class="p-inputtext p-component col" v-model.trim="data.primaryActorId"
                            name="primaryActorId">
                            <option value="" disabled>Select an Actor</option>
                            <option v-for="role in roles" :key="role.id" :value="role.id">
                                {{ role.name }}
                            </option>
                        </select>
                    </div>
                    <div class="field grid">
                        <label for="goalInContext" class="required col-fixed w-7rem">Goal in Context</label>
                        <InputText v-model.trim="data.goalInContext" name="goalInContext" required
                            placeholder="Enter a goal in context" class="col" />
                    </div>
                    <div class="field grid">
                        <label for="preconditionId" class="required col-fixed w-7rem">Pre-condition</label>
                        <select class="p-inputtext p-component col" v-model.trim="data.preconditionId"
                            name="preconditionId">
                            <option value="" disabled>Select a pre-condition</option>
                            <option v-for="assumption in assumptions" :key="assumption.id" :value="assumption.id">
                                {{ assumption.name }}
                            </option>
                        </select>
                    </div>
                    <div class="field grid">
                        <label for="triggerId" class="required col-fixed w-7rem">Trigger</label>
                        <select class="p-inputtext p-component col" v-model.trim="data.triggerId" name="triggerId">
                            <option value="" disabled>Select a trigger</option>
                            <option v-for="trigger in triggers" :key="trigger.id" :value="trigger.id">
                                {{ trigger.name }}
                            </option>
                        </select>
                    </div>
                    <div class="field grid">
                        <label for="mainSuccessScenario" class="required col-fixed w-7rem">Main Success
                            Scenario</label>
                        <Textarea v-model.trim="data.mainSuccessScenario" name="mainSuccessScenario" required
                            placeholder="Enter a main success scenario" rows="5" cols="30" class="col" />
                    </div>
                    <div class="field grid">
                        <label for="successGuaranteeId" class="required col-fixed w-7rem">Success Guarantee</label>
                        <select class="p-inputtext p-component col" v-model.trim="data.successGuaranteeId"
                            name="successGuaranteeId">
                            <option value="" disabled>Select a success guarantee</option>
                            <option v-for="effect in effects" :key="effect.id" :value="effect.id">
                                {{ effect.name }}
                            </option>
                        </select>
                    </div>
                    <div class="field grid">
                        <label for="extensions" class="required col-fixed w-7rem">Extensions</label>
                        <Textarea v-model.trim="data.extensions" name="extensions" required
                            placeholder="Enter extensions" rows="5" cols="30" class="col" />
                    </div>
                </template>
            </XDataTable>
        </TabPanel>
    </TabView>
</template>