<script lang="ts" setup>
import { MoscowPriority } from '~/server/domain/requirements/index';
import { NIL as emptyUuid } from 'uuid';
import camelCaseToTitle from '~/utils/camelCaseToTitle';

useHead({ title: 'Functionality' })
definePageMeta({ name: 'Goals Functionality' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Functionality').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

type FunctionalBehaviorViewModel = {
    id: string;
    name: string;
    statement: string;
    priority: MoscowPriority;
}

const { data: functionalBehaviors, refresh, status, error: getFunctionalBehaviorsError } = await useFetch(`/api/functional-behaviors`, {
    query: { solutionId }
}),
    emptyFunctionalBehavior: FunctionalBehaviorViewModel = {
        id: emptyUuid,
        name: '',
        statement: '',
        priority: MoscowPriority.MUST
    };

if (getFunctionalBehaviorsError.value)
    $eventBus.$emit('page-error', getFunctionalBehaviorsError.value);

const onCreate = async (data: FunctionalBehaviorViewModel) => {
    await $fetch(`/api/functional-behaviors`, {
        method: 'POST',
        body: {
            ...data,
            solutionId,
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: FunctionalBehaviorViewModel) => {
    await $fetch(`/api/functional-behaviors/${data.id}`, {
        method: 'PUT',
        body: {
            ...data,
            solutionId,
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/functional-behaviors/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>

<template>
    <p>
        This section describes the Functional Behaviors of the solution.
        These are the features that the solution must have to meet the needs of the users.
        They describe <strong>WHAT</strong> the solution must do and not how it does it.
    </p>

    <XDataTable :datasource="functionalBehaviors" :empty-record="emptyFunctionalBehavior" :on-create="onCreate"
        :on-update="onUpdate" :on-delete="onDelete" :loading="status === 'pending'">
        <template #rows>
            <Column v-for="key in Object.keys(emptyFunctionalBehavior)" :key="key" :field="key"
                :header="camelCaseToTitle(key)">
                <template #body="{ data, field }">
                    <Checkbox v-if="typeof data[field] === 'boolean'" v-model="data[field]" disabled />
                    <span v-else-if="data[field] instanceof Date">{{ data[field].toLocaleString() }}</span>
                    <span v-else>{{ data[field] }}</span>
                </template>
            </Column>
        </template>
        <template #createDialog="{ data } : { data: FunctionalBehaviorViewModel }">
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText v-model.trim="data.name" name="name" required class="col" />
            </div>
            <div class="field grid">
                <label for="statement" class="required col-fixed w-7rem">Statement</label>
                <InputText v-model.trim="data.statement" name="statement" required class="col" />
            </div>
        </template>
        <template #editDialog="{ data } : { data: FunctionalBehaviorViewModel }">
            <input type="hidden" v-model="data.id" name="id" />
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText v-model.trim="data.name" name="name" required class="col" />
            </div>
            <div class="field grid">
                <label for="statement" class="required col-fixed w-7rem">Statement</label>
                <InputText v-model.trim="data.statement" name="statement" required class="col" />
            </div>
        </template>
    </XDataTable>
</template>