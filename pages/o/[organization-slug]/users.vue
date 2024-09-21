<script setup lang="ts">
import { NIL as emptyUuid } from 'uuid'
import { AppRole } from '~/server/domain/application/index';

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
    <XDataTable :datasource="users" :empty-record="emptyUser" :on-create="onCreate" :on-delete="onDelete"
        :on-update="onUpdate" :loading="status === 'pending'">
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
            <Column field="email" header="Email" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                        placeholder="Search by email" />
                </template>
                <template #body="{ data, field }">
                    <span>{{ data[field] }}</span>
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
            </Column>
        </template>
        <template #createDialog="{ data } : { data: UserViewModel }">
            <span>Invite existing user</span>
            <hr>
            <div class="field grid">
                <label for="email" class="required col-fixed w-7rem">Email</label>
                <InputText v-model.trim="data.email" name="email" placeholder="Enter email" class="col" />
            </div>
            <div class="field grid">
                <label for="role" class="required col-fixed w-7rem">Role</label>
                <select class="p-inputtext p-component col" v-model="data.role" name="role">
                    <option v-for="role in Object.values(AppRole)" :key="role" :value="role">
                        {{ role }}
                    </option>
                </select>
            </div>
        </template>
        <template #editDialog="{ data } : { data: UserViewModel }">
            <input type="hidden" id="edit-id" v-model="data.id" name="id" />
            <div class="field grid">
                <label class="required col-fixed w-7rem">ID</label>
                <span id="edit-id" class="col">{{ data.id }}</span>
            </div>
            <div class="field grid">
                <label class="required col-fixed w-7rem">Email</label>
                <span id="edit-email" class="col">{{ data.email }}</span>
            </div>
            <div class="field grid">
                <label class="required col-fixed w-7rem">Creation Date</label>
                <span id="creationDate" class="col">{{ data.creationDate }}</span>
            </div>
            <div class="field grid">
                <label class="required col-fixed w-7rem">Last Login Date</label>
                <span id="lastLoginDate" class="col">{{ data.lastLoginDate }}</span>
            </div>
            <div class="field grid">
                <label for="isSystemAdmin" class="required col-fixed w-7rem">System Admin</label>
                <Checkbox v-model="data.isSystemAdmin" name="isSystemAdmin" disabled class="col" />
            </div>
            <div class="field grid">
                <label for="role" class="required col-fixed w-7rem">Role</label>
                <select class="p-inputtext p-component col" v-model="data.role" name="role">
                    <option v-for="role in Object.values(AppRole)" :key="role" :value="role">
                        {{ role }}
                    </option>
                </select>
            </div>
        </template>
    </XDataTable>
</template>