<script setup lang="ts">
import { AppUser, AppRole } from '~/server/domain/application/index.js'
import { Organization } from '~/server/domain/requirements';

useHead({ title: 'Users' })
definePageMeta({ name: 'Organization Users' })

const { $eventBus } = useNuxtApp()

const { organizationslug } = useRoute('Organization Users').params,
    { data: organizations, error: getOrgError } = await useFetch<Organization[]>(`/api/organizations/`, {
        query: { slug: organizationslug }
    }),
    organization = ref(organizations.value?.[0]!)

if (getOrgError.value)
    $eventBus.$emit('page-error', getOrgError.value)

const { data: users, status, refresh, error: getUserError } = await useFetch<(AppUser)[]>('/api/appusers', {
    query: {
        organizationId: organization.value?.id
    },
    transform: (data: any[]) => data.map<AppUser>((user) => {
        user.creationDate = new Date(user.creationDate)
        user.lastLoginDate = user.lastLoginDate ? new Date(user.lastLoginDate) : undefined
        return user
    })
})

if (getUserError.value)
    $eventBus.$emit('page-error', getUserError.value)

const onCreate = async (data: AppUser) => {
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

const onUpdate = async (data: AppUser) => {
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
    <XDataTable :viewModel="{
        name: 'text',
        email: 'text',
        role: 'text',
        isSystemAdmin: 'boolean',
        creationDate: 'date',
        lastLoginDate: 'date'
    }" :createModel="{
        email: 'text',
        role: Object.values(AppRole),
    }" :editModel="{
        id: 'hidden',
        email: 'text',
        role: Object.values(AppRole),
        isSystemAdmin: 'boolean'
    }" :datasource="users" :on-create="onCreate" :on-delete="onDelete" :on-update="onUpdate"
        :loading="status === 'pending'" :organizationSlug="organizationslug" entityName="AppUser"
        :showRecycleBin="false">
    </XDataTable>
</template>