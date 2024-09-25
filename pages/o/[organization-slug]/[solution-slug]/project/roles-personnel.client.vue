<script lang="ts" setup>
import { NIL as emptyUuid } from 'uuid';
import camelCaseToTitle from '~/utils/camelCaseToTitle';

useHead({ title: 'Roles & Personnel' })
definePageMeta({ name: 'Roles & Personnel' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Roles & Personnel').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

type PersonViewModel = {
    id: string;
    name: string;
    email: string;
}

const { data: personnel, refresh, status, error: getPersonnelError } = await useFetch(`/api/persons`, {
    query: { solutionId }
}),
    emptyPerson: PersonViewModel = { id: emptyUuid, name: '', email: '' };

if (getPersonnelError.value)
    $eventBus.$emit('page-error', getPersonnelError.value)

const onCreate = async (data: PersonViewModel) => {
    await $fetch(`/api/persons`, {
        method: 'POST',
        body: {
            ...data,
            solutionId,
            statement: ''
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh();
}

const onUpdate = async (data: PersonViewModel) => {
    await $fetch(`/api/persons/${data.id}`, {
        method: 'PUT',
        body: {
            ...data,
            solutionId,
            statement: ''
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh();
}

const onDelete = async (id: string) => {
    await $fetch(`/api/persons/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh();
}
</script>
<template>
    <p>
        Roles & Personnel lists the roles and personnel involved in the project
        along with their responsibilities, availability, and contact information.
    </p>

    <XDataTable :datasource="personnel" :empty-record="emptyPerson" :on-create="onCreate" :on-update="onUpdate"
        :on-delete="onDelete" :loading="status === 'pending'">
        <template #rows>
            <Column v-for="key in Object.keys(emptyPerson)" :key="key" :field="key" :header="camelCaseToTitle(key)">
                <template #body="{ data, field }">
                    <Checkbox v-if="typeof data[field] === 'boolean'" v-model="data[field]" disabled />
                    <span v-else-if="data[field] instanceof Date">{{ data[field].toLocaleString() }}</span>
                    <span v-else>{{ data[field] }}</span>
                </template>
            </Column>
        </template>
        <template #createDialog="{ data } : { data: PersonViewModel }">
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText name="name" v-model.trim="data.name" required placeholder="Name" class="col" />
            </div>
            <div class="field grid">
                <label for="email" class="required col-fixed w-7rem">Email</label>
                <InputText name="email" v-model.trim="data.email" required placeholder="Email" class="col" />
            </div>
        </template>
        <template #editDialog="{ data } : { data: PersonViewModel }">
            <input type="hidden" v-model="data.id" name="id" />
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText v-model.trim="data.name" name="name" required placeholder="Name" class="col" />
            </div>
            <div class="field grid">
                <label for="email" class="required col-fixed w-7rem">Email</label>
                <InputText v-model.trim="data.email" name="email" required placeholder="Email" class="col" />
            </div>
        </template>
    </XDataTable>
</template>