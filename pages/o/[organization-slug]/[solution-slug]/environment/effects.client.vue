<script lang="ts" setup>
import { NIL as emptyUuid } from 'uuid';
import camelCaseToTitle from '~/utils/camelCaseToTitle';

useHead({ title: 'Effects' })
definePageMeta({ name: 'Effects' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Effects').params,
    { data: solutions, error: getSolutionError } = await useFetch('/api/solutions', {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id!

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

type EffectViewModel = {
    id: string;
    name: string;
    statement: string;
}

const { data: effects, refresh, status, error: getEffectsError } = await useFetch(`/api/effects`, {
    query: { solutionId }
}),
    emptyEffect: EffectViewModel = { id: emptyUuid, name: '', statement: '' }

if (getEffectsError.value)
    $eventBus.$emit('page-error', getEffectsError.value)

const onCreate = async (data: EffectViewModel) => {
    await $fetch(`/api/effects`, {
        method: 'POST',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh()
}

const onUpdate = async (data: EffectViewModel) => {
    await $fetch(`/api/effects/${data.id}`, {
        method: 'PUT',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/effects/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>

<template>
    <p>
        An Effect is an environment property affected by a System.
        Example: "The running system will cause the temperature of the room to increase."
    </p>
    <XDataTable :datasource="effects" :empty-record="emptyEffect" :on-create="onCreate" :on-delete="onDelete"
        :on-update="onUpdate" :loading="status === 'pending'">
        <template #rows>
            <Column v-for="key in Object.keys(emptyEffect)" :key="key" :field="key" :header="camelCaseToTitle(key)">
                <template #body="{ data, field }">
                    <Checkbox v-if="typeof data[field] === 'boolean'" v-model="data[field]" disabled />
                    <span v-else-if="data[field] instanceof Date">{{ data[field].toLocaleString() }}</span>
                    <span v-else>{{ data[field] }}</span>
                </template>
            </Column>
        </template>
        <template #createDialog="{ data } : { data: EffectViewModel }">
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText name="name" v-model.trim="data.name" required placeholder="Enter name" class="col" />
            </div>
            <div class="field grid">
                <label for="statement" class="required col-fixed w-7rem">Description</label>
                <InputText name="statement" v-model.trim="data.statement" required placeholder="Enter description"
                    class="col" />
            </div>
        </template>
        <template #editDialog="{ data } : { data: EffectViewModel }">
            <input type="hidden" name="id" v-model.trim="data.id" />
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText name="name" v-model.trim="data.name" required placeholder="Enter name" class="col" />
            </div>
            <div class="field grid">
                <label for="statement" class="required col-fixed w-7rem">Description</label>
                <InputText name="statement" v-model.trim="data.statement" required placeholder="Enter description"
                    class="col" />
            </div>
        </template>
    </XDataTable>
</template>