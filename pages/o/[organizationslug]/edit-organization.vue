<script lang="ts" setup>
import { Organization } from '#shared/domain'
import { slugify } from '#shared/utils'
import type { z } from 'zod'

definePageMeta({ name: 'Edit Organization', middleware: 'auth' })
useHead({ title: 'Edit Organization' })

const router = useRouter(),
    { $eventBus } = useNuxtApp(),
    { organizationslug: organizationSlug } = useRoute('Edit Organization').params,
    { data: organization, error: getOrgError } = await useFetch(`/api/organization/${organizationSlug}`)

if (!organization.value) {
    $eventBus.$emit('page-error', getOrgError.value)
    throw new Error('Organization not found')
}

const oldSlug = organization.value.slug

const formSchema = Organization.innerType().pick({
    name: true,
    slug: true,
    description: true
})

type FormSchema = z.infer<typeof formSchema>

const formState = reactive<FormSchema>({
    name: organization.value.name,
    slug: organization.value.slug,
    description: organization.value.description
})

const updateOrganization = async (data: FormSchema) => {
    try {
        await $fetch(`/api/organization/${oldSlug}`, {
            method: 'PUT',
            body: data
        })

        router.push({ name: 'Organization', params: { organizationslug: data.slug } })
    } catch (error) {
        $eventBus.$emit('page-error', error)
    }
}

const cancel = () => {
    router.push({ name: 'Organization', params: { organizationslug: oldSlug } })
}

// Handle state updates from XForm component
const handleStateUpdate = (newState: Partial<FormSchema>) => {
    // Check if the name changed before updating formState
    const nameChanged = newState.name !== undefined && newState.name !== formState.name
    const newName = newState.name

    Object.assign(formState, newState)

    // If the name changed, update the slug
    if (nameChanged && newName) {
        formState.slug = slugify(newName)
    }
}
</script>

<template>
    <h1>Edit Organization</h1>

    <XForm
        :schema="formSchema"
        :state="formState"
        :on-submit="updateOrganization"
        :on-cancel="cancel"
        @update:state="handleStateUpdate"
    />
</template>
