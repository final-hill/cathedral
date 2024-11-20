<script setup lang="ts">
import { AppRole } from '~/domain/application/AppRole'
import type { AppUserViewModel, OrganizationViewModel } from '#shared/models'

useHead({ title: 'Users' })
definePageMeta({ name: 'Organization Users' })

const { $eventBus } = useNuxtApp(),
    { organizationslug: organizationSlug } = useRoute('Organization Users').params,
    { data: users, status, refresh, error: getUserError } = await useFetch<AppUserViewModel[]>('/api/appusers', {
        query: { organizationSlug },
        transform: (data: any[]) => data.map<AppUserViewModel>((user) => {
            user.creationDate = new Date(user.creationDate)
            user.lastLoginDate = user.lastLoginDate ? new Date(user.lastLoginDate) : undefined
            return user
        })
    })

if (getUserError.value)
    $eventBus.$emit('page-error', getUserError.value)

const onCreate = async (data: AppUserViewModel) => {
    await $fetch(`/api/appusers/`, {
        method: 'POST',
        body: {
            email: data.email,
            organizationSlug,
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
        body: { organizationSlug }
    }).catch((error) => {
        $eventBus.$emit('page-error', error)
    })

    refresh()
}

const onUpdate = async (data: AppUserViewModel) => {
    await $fetch(`/api/appusers/${data.id}`, {
        method: 'PUT',
        body: {
            organizationSlug,
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
        :loading="status === 'pending'" :organizationSlug="organizationSlug" entityName="AppUser"
        :showRecycleBin="false">
    </XDataTable>
</template>