<script setup lang="ts">
import { FilterMatchMode } from 'primevue/api';
import { NIL as emptyUuid } from 'uuid'
import AppRole from '~/server/domain/application/AppRole';

useHead({ title: 'Users' })
definePageMeta({ name: 'Organization Users' })

const { $eventBus } = useNuxtApp()

const { organizationslug } = useRoute('Organization Users').params,
    { data: organizations, error: getOrgError } = await useFetch(`/api/organizations/`, {
        query: { slug: organizationslug }
    }),
    organization = ref(organizations.value?.[0])

if (getOrgError.value)
    $eventBus.$emit('page-error', getOrgError.value)

type UserViewModel = {
    id: string;
    name: string;
    email: string;
    role: AppRole;
    creationDate?: Date;
    lastLoginDate?: Date;
    isSystemAdmin?: boolean;
}

const { data: users, status, refresh, error: getUserError } = await useFetch('/api/appusers', {
    query: {
        organizationId: organization.value?.id
    },
    transform: (data: any[]) => data.map<UserViewModel>((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        creationDate: new Date(user.creationDate),
        lastLoginDate: user.lastLoginDate ? new Date(user.lastLoginDate) : undefined,
        isSystemAdmin: user.isSystemAdmin,
        role: user.role
    }))
})

if (getUserError.value)
    $eventBus.$emit('page-error', getUserError.value)

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'email': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'creationDate': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'lastLoginDate': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'isSystemAdmin': { value: null, matchMode: FilterMatchMode.EQUALS },
    'role': { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const emptyUser: UserViewModel = {
    id: emptyUuid,
    name: '',
    email: '',
    role: AppRole.ORGANIZATION_READER,
    creationDate: undefined,
    lastLoginDate: undefined,
    isSystemAdmin: false
}

const onCreate = async (data: UserViewModel) => {
    await $fetch(`/api/appusers/`, {
        method: 'POST',
        body: {
            email: data.email,
            organizationId: organization.value?.id,
            role: data.role
        }
    }).catch((error) => {
        $eventBus.$emit('page-error', error.message)
    })

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/appusers/${id}`, {
        method: 'DELETE',
        body: {
            organizationId: organization.value?.id
        }
    }).catch((error) => {
        $eventBus.$emit('page-error', error)
    })

    refresh()
}

const onUpdate = async (data: UserViewModel) => {
    await $fetch(`/api/appusers/${data.id}`, {
        method: 'PUT',
        body: {
            organizationId: organization.value?.id,
            role: data.role
        }
    }).catch((error) => {
        $eventBus.$emit('page-error', error)
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
        btn-create-label="Invite existing user" :on-delete="onDelete" :on-update="onUpdate">
        <Column field="name" header="Name" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by name" />
            </template>
            <template #body="{ data, field }">
                {{ data[field] }}
            </template>
            <template #editor="{ data, field }">
                <span v-if="data['id'] === emptyUuid">New User</span>
                <span v-else>{{ data[field] }}</span>
            </template>
        </Column>
        <Column field="email" header="Email" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by email" />
            </template>
            <template #body="{ data, field }">
                <span>{{ data[field] }}</span>
            </template>
            <template #editor="{ data, field }">
                <InputText v-if="data['id'] === emptyUuid" v-model.trim="data[field]" placeholder="Enter email" />
                <span v-else>{{ data[field] }}</span>
            </template>
        </Column>
        <Column field="creationDate" header="Creation Date" sortable>
            <template #body="{ data, field }">
                {{ data[field]?.toLocaleString() }}
            </template>
        </Column>
        <Column field="lastLoginDate" header="Last Login Date" sortable>
            <template #body="{ data, field }">
                {{ data[field]?.toLocaleString() }}
            </template>
        </Column>
        <Column field="isSystemAdmin" header="System Admin">
            <template #body="{ data, field }">
                <Checkbox v-model="data[field]" disabled />
            </template>
        </Column>
        <Column field="role" header="Role">
            <template #body="{ data, field }">
                {{ data[field] }}
            </template>
            <template #editor="{ data, field }">
                <Dropdown v-model="data[field]" :options="Object.values(AppRole)" />
            </template>
        </Column>
    </XDataTable>
</template>