<script setup lang="ts">
import { AppUser } from '#shared/domain/application'
import type { z } from 'zod'

useHead({ title: 'Users' })
definePageMeta({ name: 'Organization Users' })

const { $eventBus } = useNuxtApp(),
    { organizationslug: organizationSlug } = useRoute('Organization Users').params,
    { data: users, status, refresh, error: getUserError } = await useFetch('/api/appusers', {
        query: { organizationSlug },
        transform: (data) => data.map((user) => ({
            ...user,
            creationDate: new Date(user.creationDate),
            lastLoginDate: user.lastLoginDate ? new Date(user.lastLoginDate) : undefined,
            lastModified: new Date(user.lastModified)
        }))
    })

if (getUserError.value)
    $eventBus.$emit('page-error', getUserError.value)

const viewSchema = AppUser.pick({
    name: true,
    email: true,
    role: true,
    isSystemAdmin: true,
    creationDate: true,
    lastLoginDate: true
})
const editSchema = AppUser.pick({
    id: true,
    email: true,
    role: true,
    isSystemAdmin: true
})
const createSchema = AppUser.pick({
    email: true,
    role: true
})

const onCreate = async (data: z.infer<typeof createSchema>) => {
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

const onUpdate = async (data: z.infer<typeof editSchema> & { id: string }) => {
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

    <p> {{ AppUser.description }} </p>

    <XDataTable :viewSchema="viewSchema" :createSchema="createSchema" :editSchema="editSchema" :data="users"
        :onCreate="onCreate" :onDelete="onDelete" :onUpdate="onUpdate" :loading="status === 'pending'">
    </XDataTable>
</template>