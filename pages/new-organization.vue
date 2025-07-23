<script lang="ts" setup>
import { slugify } from '#shared/utils'
import type { z } from 'zod'
import { Organization } from '#shared/domain'

definePageMeta({ name: 'New Organization', middleware: 'auth' })
useHead({ title: 'New Organization' })

const router = useRouter(),
    { $eventBus } = useNuxtApp()

const formSchema = Organization.innerType().pick({
    name: true,
    slug: true,
    description: true
})

type FormSchema = z.infer<typeof formSchema>

const formState = reactive<FormSchema>({
    name: '',
    slug: '',
    description: ''
})

const createOrganization = async (data: FormSchema) => {
    const newSlug = (await $fetch('/api/organization', {
        method: 'post',
        body: data
    }).catch(e => $eventBus.$emit('page-error', e)))

    if (newSlug)
        router.push({ name: 'Organization', params: { organizationslug: data.slug } })
    else
        $eventBus.$emit('page-error', 'Failed to create organization. No organization ID returned.')
}

const cancel = () => {
    router.push({ name: 'Home' })
}

// Handle state updates from XForm component
const handleStateUpdate = (newState: Partial<FormSchema>) => {
    // Check if the name changed before updating formState
    const nameChanged = newState.name !== undefined && newState.name !== formState.name
    const newName = newState.name

    // Update our form state with changes from XForm
    Object.assign(formState, newState)

    // If the name changed, update the slug
    if (nameChanged && newName) {
        formState.slug = slugify(newName)
    }
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
