<script setup lang="ts">
import { FilterMatchMode } from 'primevue/api';

useHead({ title: 'Users' })
definePageMeta({ name: 'Organization Users' })

const { getSession, } = useAuth(),
    session = await getSession();

const { organizationslug } = useRoute('Organization Users').params,
    { data: organizations } = await useFetch(`/api/organizations/`, { query: { slug: organizationslug } }),
    organization = ref(organizations.value?.[0])

const { data: users, status, refresh } = await useFetch('/api/appusers', {
    query: {
        organizationId: organization.value?.id
    }
})

type UserViewModel = {
    id: string
    name: string
    roles: string[]
    creationDate: Date
    isSystemAdmin: boolean
}

const filters = ref({
    'id': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'creationDate': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'isSystemAdmin': { value: null, matchMode: FilterMatchMode.EQUALS },
});

const emptyUser: UserViewModel = {
    id: 'john.doe@example.com',
    name: 'John Doe',
    roles: [],
    creationDate: new Date(),
    isSystemAdmin: false
}

const onCreate = async (data: UserViewModel) => {
    await $fetch(`/api/appusers`, {
        method: 'POST',
        body: {
            id: data.id,
            organizationId: organization.value?.id,
            isSystemAdmin: data.isSystemAdmin
            // TODO: Roles
        }
    })

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/appusers/${id}`, { method: 'DELETE' })
    refresh()
}

const onUpdate = async (data: UserViewModel) => {
    await $fetch(`/api/appusers/${data.id}`, {
        method: 'PUT',
        body: {
            id: data.id,
            organizationId: organization.value?.id,
            isSystemAdmin: data.isSystemAdmin
            // TODO: Roles
        }
    })
    refresh()
}
</script>

<template>
    <h1>Application Users</h1>
    <p>
        Use this page to manage the users of your organization.
    </p>
    <XDataTable :datasource="users" :empty-record="emptyUser" :filters="filters" :on-create="onCreate"
        :on-delete="onDelete" :on-update="onUpdate">
        <Column field="id" header="Email" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by email" />
            </template>
            <template #body="{ data, field }">
                {{ data[field] }}
            </template>
        </Column>
        <Column field="name" header="Name" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by name" />
            </template>
            <template #body="{ data, field }">
                {{ data[field] }}
            </template>
        </Column>
        <Column field="creationDate" header="Creation Date" sortable>
            <template #body="{ data, field }">
                {{ data[field] }}
            </template>
        </Column>
        <Column field="isSystemAdmin" header="System Admin">
            <template #body="{ data, field }">
                <Checkbox v-model="data[field]" disabled />
            </template>
            <template #editor="{ data, field }" v-if="session.isSystemAdmin">
                <Checkbox v-model="data[field]" />
            </template>
        </Column>
    </XDataTable>
</template>