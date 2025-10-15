<script lang="ts" setup>
import { Organization } from '#shared/domain'
import type { z } from 'zod'

definePageMeta({ name: 'Edit Organization', middleware: 'auth' })
useHead({ title: 'Edit Organization' })

const router = useRouter(),
    { organizationslug: organizationSlug } = useRoute('Edit Organization').params,
    { data: organization } = await useApiRequest({ url: `/api/organization/${organizationSlug}`, options: {
        schema: Organization
    } })

if (!organization.value)
    throw new Error('Organization not found')

const oldSlug = organization.value.slug,
    formSchema = Organization.pick({
        name: true,
        slug: true,
        description: true
    })

type FormSchema = z.infer<typeof formSchema>

const formState = reactive<FormSchema>({
        name: organization.value.name,
        slug: organization.value.slug,
        description: organization.value.description
    }),
    updateOrganization = async (data: FormSchema) => {
        await useApiRequest({ url: `/api/organization/${oldSlug}`, options: {
            method: 'PUT',
            schema: Organization,
            body: data,
            showSuccessToast: true,
            successMessage: 'Organization updated successfully',
            errorMessage: 'Failed to update organization'
        } })

        router.push({ name: 'Organization', params: { organizationslug: data.slug } })
    },
    cancel = () => {
        router.push({ name: 'Organization', params: { organizationslug: oldSlug } })
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
    <h1>Edit Organization</h1>

    <XForm
        :schema="formSchema"
        :state="formState"
        @update:state="handleStateUpdate"
        @submit="updateOrganization"
        @cancel="cancel"
    />
</template>
