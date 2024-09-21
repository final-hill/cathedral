<script lang="ts" setup>
import { MoscowPriority } from '~/server/domain/requirements/index';
import { NIL as emptyUuid } from 'uuid';

useHead({ title: 'Scenarios' })
definePageMeta({ name: 'Goal Scenarios' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Scenarios').params as { solutionslug: string, organizationslug: string },
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id;

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

const [
    { data: userStories, refresh, status, error: getUserStoriesError },
    { data: roles, error: getRolesError },
    { data: functionalBehaviors, error: getFunctionalBehaviorsError },
    { data: outcomes, error: getOutcomesError },
] = await Promise.all([
    useFetch(`/api/user-stories`, { query: { solutionId } }),
    useFetch(`/api/stakeholders`, { query: { solutionId } }),
    useFetch(`/api/functional-behaviors`, { query: { solutionId } }),
    useFetch(`/api/outcomes`, { query: { solutionId } })
]),
    emptyUserStory: UserStoryViewModel = {
        id: emptyUuid,
        name: '',
        primaryActorId: emptyUuid,
        functionalBehaviorId: emptyUuid,
        outcomeId: emptyUuid,
        priority: MoscowPriority.MUST
    }

if (getUserStoriesError.value)
    $eventBus.$emit('page-error', getUserStoriesError.value);
if (getRolesError.value)
    $eventBus.$emit('page-error', getRolesError.value);
if (getFunctionalBehaviorsError.value)
    $eventBus.$emit('page-error', getFunctionalBehaviorsError.value);
if (getOutcomesError.value)
    $eventBus.$emit('page-error', getOutcomesError.value);

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

    refresh();
}

const onUserStoryUpdate = async (userStory: UserStoryViewModel) => {
    await $fetch(`/api/user-stories/${userStory.id}`, {
        method: 'PUT',
        body: {
            ...userStory,
            solutionId,
            statement: '',
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refresh();
}

const onUserStoryDelete = async (id: string) => {
    await $fetch(`/api/user-stories/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e));
    refresh();
}
</script>

<template>
    <h1>Scenarios</h1>

    <p>
        This section defines the main scenarios that the system must support to achieve the goals of the solution.
    </p>
    <p>
        Before you can begin, you must define one or more
        <NuxtLink class="underline" :to="{ name: 'Stakeholders', params: { solutionslug, organizationslug } }">
            Stakeholders</NuxtLink>,
        <NuxtLink class="underline" :to="{ name: 'Goals Functionality', params: { solutionslug, organizationslug } }"
            v-text="'Functional Behaviors'" />,
        and <NuxtLink class="underline" :to="{ name: 'Outcomes', params: { solutionslug, organizationslug } }">Outcomes
        </NuxtLink>
        for the solution.
    </p>

    <XDataTable :datasource="userStories" :emptyRecord="emptyUserStory" :onCreate="onUserStoryCreate"
        :onUpdate="onUserStoryUpdate" :onDelete="onUserStoryDelete" :loading="status === 'pending'">
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
            <Column field="primaryActorId" header="Stakeholder">
                <template #filter="{ filterModel, filterCallback }">
                    <select class="p-inputtext p-component" v-model.trim="filterModel.value" @input="filterCallback()">
                        <option value="" disabled>Select a Stakeholder</option>
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
                    <select class="p-inputtext p-component" v-model.trim="filterModel.value" @input="filterCallback()">
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
                    <select class="p-inputtext p-component" v-model.trim="filterModel.value" @input="filterCallback()">
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
                <InputText name="name" v-model.trim="data.name" required placeholder="Enter a name" class="col" />
            </div>
            <div class="field grid">
                <label for="primaryActorId" class="required col-fixed w-7rem">Stakeholder</label>
                <select class="p-inputtext p-component col" name="primaryActorId" v-model.trim="data.primaryActorId">
                    <option value="" disabled>Select a Stakeholder</option>
                    <option v-for="role in roles" :key="role.id" :value="role.id">
                        {{ role.name }}
                    </option>
                </select>
            </div>
            <div class="field grid">
                <label for="functionalBehaviorId" class="required col-fixed w-7rem">Behavior</label>
                <select class="p-inputtext p-component col" name="functionalBehaviorId"
                    v-model.trim="data.functionalBehaviorId">
                    <option value="" disabled>Select a Behavior</option>
                    <option v-for="behavior in functionalBehaviors" :key="behavior.id" :value="behavior.id">
                        {{ behavior.name }}
                    </option>
                </select>
            </div>
            <div class="field grid">
                <label for="outcomeId" class="required col-fixed w-7rem">Outcome</label>
                <select class="p-inputtext p-component col" name="outcomeId" v-model.trim="data.outcomeId">
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
                <InputText name="name" v-model.trim="data.name" required placeholder="Enter a name" class="col" />
            </div>
            <div class="field grid">
                <label for="primaryActorId" class="required col-fixed w-7rem">Stakeholder</label>
                <select class="p-inputtext p-component col" name="primaryActorId" v-model.trim="data.primaryActorId">
                    <option value="" disabled>Select a Stakeholder</option>
                    <option v-for="role in roles" :key="role.id" :value="role.id">
                        {{ role.name }}
                    </option>
                </select>
            </div>
            <div class="field grid">
                <label for="functionalBehaviorId" class="required col-fixed w-7rem">Behavior</label>
                <select class="p-inputtext p-component col" name="functionalBehaviorId"
                    v-model.trim="data.functionalBehaviorId">
                    <option value="" disabled>Select a Behavior</option>
                    <option v-for="behavior in functionalBehaviors" :key="behavior.id" :value="behavior.id">
                        {{ behavior.name }}
                    </option>
                </select>
            </div>
            <div class="field grid">
                <label for="outcomeId" class="required col-fixed w-7rem">Outcome</label>
                <select class="p-inputtext p-component col" name="outcomeId" v-model.trim="data.outcomeId">
                    <option value="" disabled>Select an Outcome</option>
                    <option v-for="outcome in outcomes" :key="outcome.id" :value="outcome.id">
                        {{ outcome.name }}
                    </option>
                </select>
            </div>
        </template>
    </XDataTable>
</template>