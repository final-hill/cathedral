<script lang="ts" setup>
import { slugify } from '#shared/utils'
import type { z } from 'zod'
import { Organization } from '#shared/domain'

definePageMeta({ name: 'New Organization', middleware: 'auth' })
useHead({ title: 'New Organization' })

const router = useRouter(),
    { $eventBus } = useNuxtApp(),
    { fetch: refreshSession } = useUserSession(),
    formSchema = Organization.innerType().pick({
        name: true,
        slug: true,
        description: true
    })

type FormSchema = z.infer<typeof formSchema>

const formState = reactive<FormSchema>({
        name: '',
        slug: '',
        description: ''
    }),
    createOrganization = async (data: FormSchema) => {
        const newSlug = (await $fetch('/api/organization', {
            method: 'post',
            body: data
        }).catch(e => $eventBus.$emit('page-error', e)))

        if (newSlug) {
            await refreshSession()
            router.push({ name: 'Organization', params: { organizationslug: newSlug } })
        } else $eventBus.$emit('page-error', 'Failed to create organization. No organization ID returned.')
    },
    cancel = () => {
        router.push({ name: 'Home' })
    },
    handleStateUpdate = (newState: Partial<FormSchema>) => {
        const nameChanged = newState.name !== undefined && newState.name !== formState.name,
            newName = newState.name

        Object.assign(formState, newState)

        if (nameChanged && newName)
            formState.slug = slugify(newName)
    }
</script>

<template>
    <XForm
        :schema="formSchema"
        :state="formState"
        :on-submit="createOrganization"
        :on-cancel="cancel"
        @update:state="handleStateUpdate"
    />
</template>
